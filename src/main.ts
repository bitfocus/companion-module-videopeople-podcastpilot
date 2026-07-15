import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import {
	UpdateVariableDefinitions,
	UpdateVariableValues,
	UpdateTickValues,
	UpdateLevelValues,
	type VariablesSchema,
} from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { emptyStatus, type CommandReply, type ServerEvent, type StatusEvent } from './state.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

// Node 22-runtimen har indbygget WebSocket (undici); minimal typeflade her,
// så modulet ikke behøver nogen dependency til klienten.
type WSLike = {
	readyState: number
	send(data: string): void
	close(): void
	onopen: (() => void) | null
	onmessage: ((event: { data: unknown }) => void) | null
	onclose: (() => void) | null
	onerror: (() => void) | null
}
const WebSocketCtor = (globalThis as unknown as { WebSocket: new (url: string) => WSLike }).WebSocket

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig // sættes i init()
	state: StatusEvent = emptyStatus()

	private ws: WSLike | null = null
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null
	private destroyed = false
	/// Struktur-nøgle (kilde/spor/markør-navne): ændres den, skal
	/// actions/feedbacks/presets genudstilles med friske dropdowns.
	private structureKey = ''

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)
		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()
		this.connect()
	}

	async destroy(): Promise<void> {
		this.destroyed = true
		this.clearReconnect()
		this.closeSocket()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.clearReconnect()
		this.closeSocket()
		this.updateStatus(InstanceStatus.Connecting)
		this.connect()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	// MARK: Forbindelse

	private connect(): void {
		if (this.destroyed) return
		const url = `ws://${this.config.host || '127.0.0.1'}:${this.config.port || 9720}`
		let ws: WSLike
		try {
			ws = new WebSocketCtor(url)
		} catch (error) {
			this.updateStatus(InstanceStatus.ConnectionFailure, String(error))
			this.scheduleReconnect()
			return
		}
		this.ws = ws

		ws.onopen = () => {
			// Token sendes altid hvis udfyldt — serveren svarer bare ok,
			// hvis forbindelsen allerede er betroet (localhost).
			if (this.config.token) {
				ws.send(JSON.stringify({ command: 'auth', token: this.config.token }))
			}
			ws.send(JSON.stringify({ command: 'status' }))
			if (this.config.levels) {
				ws.send(JSON.stringify({ command: 'subscribe', levels: true }))
			}
		}

		ws.onmessage = (event) => {
			let parsed: ServerEvent | CommandReply
			try {
				parsed = JSON.parse(String(event.data)) as ServerEvent | CommandReply
			} catch {
				return
			}
			this.handleMessage(parsed)
		}

		ws.onclose = () => {
			if (this.destroyed) return
			this.updateStatus(
				InstanceStatus.Disconnected,
				'Connection closed – is PodcastPilot running with the control API enabled?',
			)
			this.scheduleReconnect()
		}
		ws.onerror = () => {
			if (this.destroyed) return
			this.updateStatus(InstanceStatus.ConnectionFailure, `Cannot reach ${url}`)
		}
	}

	private handleMessage(msg: ServerEvent | CommandReply): void {
		if ('ok' in msg) {
			if (!msg.ok) {
				if (msg.command === 'auth') {
					this.updateStatus(InstanceStatus.BadConfig, 'Invalid token – copy it from PodcastPilot Settings → Remote')
					this.clearReconnect() // forkert token løses ikke af at prøve igen
				} else {
					this.log('warn', `PodcastPilot rejected ${msg.command}: ${msg.error ?? 'unknown error'}`)
				}
			}
			return
		}
		switch (msg.event) {
			case 'hello':
				this.log('info', `Connected to ${msg.app} ${msg.version} (protocol ${msg.protocol})`)
				break
			case 'status': {
				this.state = msg
				this.updateStatus(InstanceStatus.Ok)
				const key = JSON.stringify([
					msg.sources.map((s) => s.name),
					msg.tracks.map((t) => t.name),
					msg.markers.map((m) => m.name),
				])
				if (key !== this.structureKey) {
					this.structureKey = key
					this.updateActions()
					this.updateFeedbacks()
					this.updatePresets()
				}
				UpdateVariableValues(this)
				this.checkFeedbacks('on_program', 'recording', 'track_muted', 'track_solo', 'source_no_signal')
				break
			}
			case 'tick':
				UpdateTickValues(this, msg)
				break
			case 'levels':
				UpdateLevelValues(this, msg)
				break
		}
	}

	/** Send en kommando til appen (actions kalder denne). */
	sendCommand(payload: Record<string, unknown>): void {
		if (this.ws && this.ws.readyState === 1) {
			this.ws.send(JSON.stringify(payload))
		} else {
			this.log('warn', `Not connected – dropped command ${String(payload.command)}`)
		}
	}

	private scheduleReconnect(): void {
		if (this.destroyed || this.reconnectTimer) return
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null
			this.connect()
		}, 2000)
	}

	private clearReconnect(): void {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}
	}

	private closeSocket(): void {
		if (this.ws) {
			this.ws.onopen = null
			this.ws.onmessage = null
			this.ws.onclose = null
			this.ws.onerror = null
			try {
				this.ws.close()
			} catch {
				// allerede lukket
			}
			this.ws = null
		}
	}
}

export { UpgradeScripts }
