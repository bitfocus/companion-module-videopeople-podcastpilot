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
		presets[`cut_${index}`] = {
			type: 'simple',
			name: `Cut to ${name}`,
			style: { text: name, size: 'auto', color: WHITE, bgcolor: DARK, show_topbar: false },
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
			style: { text: `FADE\\n${name}`, size: 'auto', color: WHITE, bgcolor: DARK, show_topbar: false },
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
		name: 'Timecode display',
		style: { text: 'TC\\n$(podcastpilot:timecode)', size: 'auto', color: WHITE, bgcolor: DARK, show_topbar: false },
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
	for (let index = 1; index <= Math.min(markerCount, 9); index++) {
		const name = self.state.markers.find((m) => m.index === index)?.name ?? `Marker ${index}`
		presets[`marker_${index}`] = {
			type: 'simple',
			name: `Marker: ${name}`,
			style: { text: name, size: 'auto', color: BLACK, bgcolor: combineRgb(255, 221, 0), show_topbar: false },
			steps: [{ down: [{ actionId: 'marker', options: { index } }], up: [] }],
			feedbacks: [],
		}
		markerPresets.push(`marker_${index}`)
	}

	const mutePresets: string[] = []
	const trackCount = Math.max(self.state.tracks.length, 4)
	for (let index = 1; index <= Math.min(trackCount, 8); index++) {
		const name = self.state.tracks.find((t) => t.index === index)?.name ?? `Track ${index}`
		presets[`mute_${index}`] = {
			type: 'simple',
			name: `Mute ${name}`,
			style: { text: `MUTE\\n${name}`, size: 'auto', color: WHITE, bgcolor: DARK, show_topbar: false },
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
					name: 'Record & timecode',
					description: 'REC toggle and a live timecode display',
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
					description:
						'Toggle mute per track. For volume on Stream Deck + dials, bind the "Track volume: adjust" action to rotate left/right',
					type: 'simple',
					presets: mutePresets,
				},
			],
		},
	]

	self.setPresetDefinitions(structure, presets)
}
