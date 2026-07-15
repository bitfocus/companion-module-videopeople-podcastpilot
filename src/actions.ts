import type { DropdownChoice } from '@companion-module/base'
import type ModuleInstance from './main.js'

export type ActionsSchema = {
	cut: { options: { source: number } }
	fade: { options: { source: number } }
	record: { options: { op: string } }
	marker: { options: { index: number } }
	sync_slate: { options: Record<string, never> }
	volume_set: { options: { track: number; db: number } }
	volume_delta: { options: { track: number; delta: number } }
	mute: { options: { track: number; op: string } }
	solo: { options: { track: number; op: string } }
	monitor_volume_delta: { options: { delta: number } }
	transition: { options: { style: string } }
}

function sourceChoices(self: ModuleInstance): DropdownChoice[] {
	if (self.state.sources.length > 0) {
		return self.state.sources.map((source) => ({ id: source.index, label: `${source.index}: ${source.name}` }))
	}
	return [1, 2, 3, 4, 5, 6, 7, 8].map((index) => ({ id: index, label: `Source ${index}` }))
}

function trackChoices(self: ModuleInstance): DropdownChoice[] {
	if (self.state.tracks.length > 0) {
		return self.state.tracks.map((track) => ({ id: track.index, label: `${track.index}: ${track.name}` }))
	}
	return [1, 2, 3, 4, 5, 6, 7, 8].map((index) => ({ id: index, label: `Track ${index}` }))
}

function markerChoices(self: ModuleInstance): DropdownChoice[] {
	if (self.state.markers.length > 0) {
		return self.state.markers.map((marker) => ({ id: marker.index, label: `${marker.index}: ${marker.name}` }))
	}
	return [1, 2, 3, 4].map((index) => ({ id: index, label: `Marker ${index}` }))
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		cut: {
			name: 'Cut to source',
			options: [{ id: 'source', type: 'dropdown', label: 'Source', choices: sourceChoices(self), default: 1 }],
			callback: async (event) => {
				self.sendCommand({ command: 'cut', source: Number(event.options.source) })
			},
		},
		fade: {
			name: 'Fade to source',
			options: [{ id: 'source', type: 'dropdown', label: 'Source', choices: sourceChoices(self), default: 1 }],
			callback: async (event) => {
				self.sendCommand({ command: 'fade', source: Number(event.options.source) })
			},
		},
		record: {
			name: 'Record',
			options: [
				{
					id: 'op',
					type: 'dropdown',
					label: 'Action',
					choices: [
						{ id: 'toggle', label: 'Toggle' },
						{ id: 'start', label: 'Start' },
						{ id: 'stop', label: 'Stop' },
					],
					default: 'toggle',
				},
			],
			callback: async (event) => {
				self.sendCommand({ command: 'record', action: String(event.options.op) })
			},
		},
		marker: {
			name: 'Add marker',
			options: [{ id: 'index', type: 'dropdown', label: 'Marker', choices: markerChoices(self), default: 1 }],
			callback: async (event) => {
				self.sendCommand({ command: 'marker', index: Number(event.options.index) })
			},
		},
		sync_slate: {
			name: 'Fire sync slate',
			options: [],
			callback: async () => {
				self.sendCommand({ command: 'syncSlate' })
			},
		},
		volume_set: {
			name: 'Track volume: set (dB)',
			options: [
				{ id: 'track', type: 'dropdown', label: 'Track', choices: trackChoices(self), default: 1 },
				{ id: 'db', type: 'number', label: 'Gain (dB)', default: 0, min: -24, max: 12, step: 0.5 },
			],
			callback: async (event) => {
				self.sendCommand({ command: 'volume', track: Number(event.options.track), db: Number(event.options.db) })
			},
		},
		volume_delta: {
			name: 'Track volume: adjust (dB) – for dials',
			options: [
				{ id: 'track', type: 'dropdown', label: 'Track', choices: trackChoices(self), default: 1 },
				{ id: 'delta', type: 'number', label: 'Change (dB)', default: 1, min: -12, max: 12, step: 0.5 },
			],
			callback: async (event) => {
				self.sendCommand({
					command: 'volume',
					track: Number(event.options.track),
					deltaDb: Number(event.options.delta),
				})
			},
		},
		mute: {
			name: 'Track mute',
			options: [
				{ id: 'track', type: 'dropdown', label: 'Track', choices: trackChoices(self), default: 1 },
				{
					id: 'op',
					type: 'dropdown',
					label: 'Action',
					choices: [
						{ id: 'toggle', label: 'Toggle' },
						{ id: 'on', label: 'Mute' },
						{ id: 'off', label: 'Unmute' },
					],
					default: 'toggle',
				},
			],
			callback: async (event) => {
				const payload: Record<string, unknown> = { command: 'mute', track: Number(event.options.track) }
				if (event.options.op === 'on') payload.muted = true
				if (event.options.op === 'off') payload.muted = false
				self.sendCommand(payload)
			},
		},
		solo: {
			name: 'Track solo',
			options: [
				{ id: 'track', type: 'dropdown', label: 'Track', choices: trackChoices(self), default: 1 },
				{
					id: 'op',
					type: 'dropdown',
					label: 'Action',
					choices: [
						{ id: 'toggle', label: 'Toggle' },
						{ id: 'on', label: 'Solo on' },
						{ id: 'off', label: 'Solo off' },
					],
					default: 'toggle',
				},
			],
			callback: async (event) => {
				const payload: Record<string, unknown> = { command: 'solo', track: Number(event.options.track) }
				if (event.options.op === 'on') payload.solo = true
				if (event.options.op === 'off') payload.solo = false
				self.sendCommand(payload)
			},
		},
		monitor_volume_delta: {
			name: 'Monitor volume: adjust – for dials',
			options: [{ id: 'delta', type: 'number', label: 'Change (0–1)', default: 0.05, min: -1, max: 1, step: 0.01 }],
			callback: async (event) => {
				self.sendCommand({ command: 'monitorVolume', delta: Number(event.options.delta) })
			},
		},
		transition: {
			name: 'Set default transition',
			options: [
				{
					id: 'style',
					type: 'dropdown',
					label: 'Style',
					choices: [
						{ id: 'cut', label: 'Cut' },
						{ id: 'fade', label: 'Fade' },
					],
					default: 'cut',
				},
			],
			callback: async (event) => {
				self.sendCommand({ command: 'transition', style: String(event.options.style) })
			},
		},
	})
}
