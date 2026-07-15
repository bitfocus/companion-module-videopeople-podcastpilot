import type ModuleInstance from './main.js'
import type { LevelsEvent, TickEvent } from './state.js'

type Index = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type VariablesSchema = {
	recording: boolean
	timecode: string
	elapsed: number
	dropped_frames: number
	session_name: string
	program_source: number
	program_source_name: string
	transition_style: string
	monitor_volume: number
} & {
	[K in `source_${Index}_name`]: string
} & {
	[K in `track_${Index}_name`]: string
} & {
	[K in `track_${Index}_gain`]: number
} & {
	[K in `track_${Index}_level`]: number
}

const INDICES: Index[] = [1, 2, 3, 4, 5, 6, 7, 8]

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const definitions = {
		recording: { name: 'Recording active' },
		timecode: { name: 'Elapsed timecode (HH:MM:SS:FF)' },
		elapsed: { name: 'Elapsed seconds' },
		dropped_frames: { name: 'Dropped frames' },
		session_name: { name: 'Session name' },
		program_source: { name: 'Program source (number)' },
		program_source_name: { name: 'Program source (name)' },
		transition_style: { name: 'Default transition style' },
		monitor_volume: { name: 'Monitor volume (0–1)' },
	} as Record<string, { name: string }>
	for (const index of INDICES) {
		definitions[`source_${index}_name`] = { name: `Source ${index} name` }
		definitions[`track_${index}_name`] = { name: `Track ${index} name` }
		definitions[`track_${index}_gain`] = { name: `Track ${index} gain (dB)` }
		definitions[`track_${index}_level`] = { name: `Track ${index} level (dBFS, needs levels enabled)` }
	}
	self.setVariableDefinitions(definitions as Parameters<typeof self.setVariableDefinitions>[0])
}

export function UpdateVariableValues(self: ModuleInstance): void {
	const status = self.state
	const program = status.sources.find((source) => source.onProgram)
	const values: Record<string, string | number | boolean> = {
		recording: status.recording,
		session_name: status.sessionName,
		program_source: program?.index ?? 0,
		program_source_name: program?.name ?? '',
		transition_style: status.transition.style,
		monitor_volume: status.monitorVolume,
	}
	for (const index of INDICES) {
		values[`source_${index}_name`] = status.sources.find((s) => s.index === index)?.name ?? ''
		const track = status.tracks.find((t) => t.index === index)
		values[`track_${index}_name`] = track?.name ?? ''
		values[`track_${index}_gain`] = track?.gainDb ?? 0
	}
	self.setVariableValues(values)
}

export function UpdateTickValues(self: ModuleInstance, tick: TickEvent): void {
	self.setVariableValues({
		timecode: tick.timecode,
		elapsed: tick.elapsed,
		dropped_frames: tick.droppedFrames,
	})
}

export function UpdateLevelValues(self: ModuleInstance, levels: LevelsEvent): void {
	const values: Record<string, number> = {}
	levels.db.forEach((db, position) => {
		const index = position + 1
		if (index >= 1 && index <= 8) values[`track_${index}_level`] = db
	})
	self.setVariableValues(values)
}
