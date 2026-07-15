/**
 * Spejl af PodcastPilots status-event (control-API protokol v1).
 * Se docs/control-api.md i PodcastPilot-repoet.
 */

export type SourceInfo = {
	index: number
	name: string
	hasSignal: boolean
	armed: boolean
	onProgram: boolean
}

export type TrackInfo = {
	index: number
	name: string
	gainDb: number
	muted: boolean
	solo: boolean
	armed: boolean
}

export type MarkerInfo = {
	index: number
	name: string
	color: string
}

export type StatusEvent = {
	event: 'status'
	recording: boolean
	sessionName: string
	transition: { style: 'cut' | 'fade'; fadeDuration: number }
	monitorVolume: number
	sources: SourceInfo[]
	tracks: TrackInfo[]
	markers: MarkerInfo[]
}

export type TickEvent = {
	event: 'tick'
	elapsed: number
	timecode: string
	droppedFrames: number
}

export type LevelsEvent = {
	event: 'levels'
	db: number[]
}

export type HelloEvent = {
	event: 'hello'
	app: string
	version: string
	protocol: number
}

export type ServerEvent = StatusEvent | TickEvent | LevelsEvent | HelloEvent

export type CommandReply = { ok: boolean; command: string; error?: string }

export function emptyStatus(): StatusEvent {
	return {
		event: 'status',
		recording: false,
		sessionName: '',
		transition: { style: 'cut', fadeDuration: 0.5 },
		monitorVolume: 0.8,
		sources: [],
		tracks: [],
		markers: [],
	}
}
