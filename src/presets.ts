import { combineRgb, type CompanionPresetDefinitions, type CompanionPresetSection } from '@companion-module/base'
import type { ModuleSchema } from './main.js'
import type ModuleInstance from './main.js'

const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)
const DARK = combineRgb(17, 17, 17)
const RED = combineRgb(201, 64, 63)

/**
 * Færdige knapper: en integrator trækker en hel side på plads på minutter.
 * Kilde-/spor-/markørnavne kommer fra appens status, så knapperne hedder
 * det samme som i PodcastPilot.
 */
export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions<ModuleSchema> = {}

	const sourceCount = Math.max(self.state.sources.length, 4)
	const sourcePresets: string[] = []
	const fadePresets: string[] = []
	for (let index = 1; index <= Math.min(sourceCount, 8); index++) {
		const name = self.state.sources.find((s) => s.index === index)?.name ?? `Source ${index}`
		// Knapteksten er en VARIABEL-reference, ikke navnet selv: knapper der
		// allerede ligger på en surface følger med når kilder omdøbes/ændres.
		const nameVar = `$(${self.label}:source_${index}_name)`
		presets[`cut_${index}`] = {
			type: 'simple',
			name: `Cut to ${name}`,
			style: { text: nameVar, size: 'auto', color: WHITE, bgcolor: DARK, show_topbar: false },
			steps: [{ down: [{ actionId: 'cut', options: { source: index } }], up: [] }],
			feedbacks: [
				{
					feedbackId: 'on_program',
					options: { source: index },
					style: { bgcolor: RED, color: WHITE },
				},
			],
		}
		sourcePresets.push(`cut_${index}`)
		presets[`fade_${index}`] = {
			type: 'simple',
			name: `Fade to ${name}`,
			style: { text: `FADE\\n${nameVar}`, size: 'auto', color: WHITE, bgcolor: DARK, show_topbar: false },
			steps: [{ down: [{ actionId: 'fade', options: { source: index } }], up: [] }],
			feedbacks: [
				{
					feedbackId: 'on_program',
					options: { source: index },
					style: { bgcolor: RED, color: WHITE },
				},
			],
		}
		fadePresets.push(`fade_${index}`)
	}

	presets['record_toggle'] = {
		type: 'simple',
		name: 'Record start/stop',
		style: { text: 'REC', size: 24, color: WHITE, bgcolor: DARK, show_topbar: false },
		steps: [{ down: [{ actionId: 'record', options: { op: 'toggle' } }], up: [] }],
		feedbacks: [
			{
				feedbackId: 'recording',
				options: {},
				style: { bgcolor: RED, color: WHITE },
			},
		],
	}
	presets['timecode'] = {
		type: 'simple',
		name: 'Recording time display',
		style: {
			text: `REC TIME\\n$(${self.label}:rec_time)`,
			size: 'auto',
			color: WHITE,
			bgcolor: DARK,
			show_topbar: false,
		},
		steps: [],
		feedbacks: [
			{
				feedbackId: 'recording',
				options: {},
				style: { bgcolor: RED, color: WHITE },
			},
		],
	}
	presets['sync_slate'] = {
		type: 'simple',
		name: 'Sync slate',
		style: { text: 'SYNC\\nSLATE', size: 'auto', color: WHITE, bgcolor: DARK, show_topbar: false },
		steps: [{ down: [{ actionId: 'sync_slate', options: {} }], up: [] }],
		feedbacks: [],
	}

	const markerPresets: string[] = []
	const markerCount = Math.max(self.state.markers.length, 4)
	for (let index = 1; index <= Math.min(markerCount, 8); index++) {
		const name = self.state.markers.find((m) => m.index === index)?.name ?? `Marker ${index}`
		const nameVar = `$(${self.label}:marker_${index}_name)`
		presets[`marker_${index}`] = {
			type: 'simple',
			name: `Marker: ${name}`,
			style: { text: nameVar, size: 'auto', color: BLACK, bgcolor: combineRgb(255, 221, 0), show_topbar: false },
			steps: [{ down: [{ actionId: 'marker', options: { index } }], up: [] }],
			feedbacks: [],
		}
		markerPresets.push(`marker_${index}`)
	}

	const mutePresets: string[] = []
	const trackCount = Math.max(self.state.tracks.length, 4)
	for (let index = 1; index <= Math.min(trackCount, 8); index++) {
		const name = self.state.tracks.find((t) => t.index === index)?.name ?? `Track ${index}`
		const nameVar = `$(${self.label}:track_${index}_name)`
		presets[`mute_${index}`] = {
			type: 'simple',
			name: `Mute ${name}`,
			style: { text: `MUTE\\n${nameVar}`, size: 'auto', color: WHITE, bgcolor: DARK, show_topbar: false },
			steps: [{ down: [{ actionId: 'mute', options: { track: index, op: 'toggle' } }], up: [] }],
			feedbacks: [
				{
					feedbackId: 'track_muted',
					options: { track: index },
					style: { bgcolor: combineRgb(255, 170, 0), color: BLACK },
				},
			],
		}
		mutePresets.push(`mute_${index}`)
	}

	// Stream Deck + / drejeknapper: tryk = mute, drej = volumen. Navn og
	// aktuel gain vises live via variabler.
	const dialPresets: string[] = []
	for (let index = 1; index <= Math.min(trackCount, 8); index++) {
		const name = self.state.tracks.find((t) => t.index === index)?.name ?? `Track ${index}`
		const nameVar = `$(${self.label}:track_${index}_name)`
		const gainVar = `$(${self.label}:track_${index}_gain)`
		presets[`dial_${index}`] = {
			type: 'simple',
			name: `Dial: ${name} (press = mute, rotate = volume)`,
			style: { text: `${nameVar}\n${gainVar} dB`, size: 'auto', color: WHITE, bgcolor: DARK, show_topbar: false },
			steps: [
				{
					down: [{ actionId: 'mute', options: { track: index, op: 'toggle' } }],
					up: [],
					rotate_left: [{ actionId: 'volume_delta', options: { track: index, delta: -1 } }],
					rotate_right: [{ actionId: 'volume_delta', options: { track: index, delta: 1 } }],
				},
			],
			feedbacks: [
				{
					feedbackId: 'track_muted',
					options: { track: index },
					style: { bgcolor: combineRgb(255, 170, 0), color: BLACK },
				},
			],
		}
		dialPresets.push(`dial_${index}`)
	}

	const structure: CompanionPresetSection[] = [
		{
			id: 'switching',
			name: 'Switching',
			definitions: [
				{
					id: 'cuts',
					name: 'Cut to source',
					description: 'Lights up red while the source is on program',
					type: 'simple',
					presets: sourcePresets,
				},
				{
					id: 'fades',
					name: 'Fade to source',
					description: 'Uses the fade duration set in PodcastPilot',
					type: 'simple',
					presets: fadePresets,
				},
			],
		},
		{
			id: 'recording',
			name: 'Recording',
			definitions: [
				{
					id: 'rec',
					name: 'Record & time',
					description: 'REC toggle and a live recording-time display',
					type: 'simple',
					presets: ['record_toggle', 'timecode', 'sync_slate'],
				},
			],
		},
		{
			id: 'markers',
			name: 'Markers',
			definitions: [
				{
					id: 'marks',
					name: 'Markers',
					description: 'Drop your predefined markers while recording',
					type: 'simple',
					presets: markerPresets,
				},
			],
		},
		{
			id: 'audio',
			name: 'Audio',
			definitions: [
				{
					id: 'mutes',
					name: 'Track mutes',
					description: 'Toggle mute per track',
					type: 'simple',
					presets: mutePresets,
				},
				{
					id: 'dials',
					name: 'Mute + volume dials',
					description:
						'For Stream Deck + dials: press toggles mute, rotating adjusts the track volume ±1 dB. Shows name and current gain',
					type: 'simple',
					presets: dialPresets,
				},
			],
		},
	]

	self.setPresetDefinitions(structure, presets)
}
