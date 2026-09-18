import { combineRgb, type DropdownChoice } from '@companion-module/base'
import type ModuleInstance from './main.js'

export type FeedbacksSchema = {
	on_program: { type: 'boolean'; options: { source: number } }
	recording: { type: 'boolean'; options: Record<string, never> }
	track_muted: { type: 'boolean'; options: { track: number } }
	track_solo: { type: 'boolean'; options: { track: number } }
	source_no_signal: { type: 'boolean'; options: { source: number } }
	sound_playing: { type: 'boolean'; options: { sound: string } }
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

// Lyde vælges på LISTEPOSITION som i actions.ts: feedbacken
// hører til "plads 2", og navnet på knappen kommer af sound_2_name-variablen,
// så en sletning bare rykker listen op uden at knappen dør. Gemte UUID'er
// fra 1.2.0 matches stadig på id i callbacken.
function soundChoices(self: ModuleInstance): DropdownChoice[] {
	const sounds = self.state.soundboard?.sounds ?? []
	const slots = Math.max(sounds.length, 8)
	const choices: DropdownChoice[] = []
	for (let slot = 1; slot <= slots; slot++) {
		const sound = sounds.find((s) => s.index === slot)
		choices.push({ id: String(slot), label: sound ? `Sound ${slot}: ${sound.name}` : `Sound ${slot}: (empty)` })
	}
	return choices
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	const sounds = soundChoices(self)
	self.setFeedbackDefinitions({
		on_program: {
			name: 'Source is on program',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(201, 64, 63),
				color: combineRgb(255, 255, 255),
			},
			options: [{ id: 'source', type: 'dropdown', label: 'Source', choices: sourceChoices(self), default: 1 }],
			callback: (feedback) => {
				const source = self.state.sources.find((s) => s.index === Number(feedback.options.source))
				return source?.onProgram === true
			},
		},
		recording: {
			name: 'Recording is active',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(201, 64, 63),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => self.state.recording,
		},
		track_muted: {
			name: 'Track is muted',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 170, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [{ id: 'track', type: 'dropdown', label: 'Track', choices: trackChoices(self), default: 1 }],
			callback: (feedback) => {
				const track = self.state.tracks.find((t) => t.index === Number(feedback.options.track))
				return track?.muted === true
			},
		},
		track_solo: {
			name: 'Track is soloed',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 221, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [{ id: 'track', type: 'dropdown', label: 'Track', choices: trackChoices(self), default: 1 }],
			callback: (feedback) => {
				const track = self.state.tracks.find((t) => t.index === Number(feedback.options.track))
				return track?.solo === true
			},
		},
		source_no_signal: {
			name: 'Source has no signal',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(90, 90, 90),
				color: combineRgb(255, 255, 255),
			},
			options: [{ id: 'source', type: 'dropdown', label: 'Source', choices: sourceChoices(self), default: 1 }],
			callback: (feedback) => {
				const source = self.state.sources.find((s) => s.index === Number(feedback.options.source))
				return source !== undefined && !source.hasSignal
			},
		},
		sound_playing: {
			name: 'Sound is playing',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 153, 68),
				color: combineRgb(255, 255, 255),
			},
			options: [{ id: 'sound', type: 'dropdown', label: 'Sound', choices: sounds, default: sounds[0].id }],
			callback: (feedback) => {
				const playing = self.state.soundboard?.playing
				if (playing == null) return false
				const raw = String(feedback.options.sound ?? '')
				if (/^\d+$/.test(raw)) return playing.index === Number(raw)
				return playing.id === raw
			},
		},
	})
}
