import { combineRgb, type DropdownChoice } from '@companion-module/base'
import type ModuleInstance from './main.js'

export type FeedbacksSchema = {
	on_program: { type: 'boolean'; options: { source: number } }
	recording: { type: 'boolean'; options: Record<string, never> }
	track_muted: { type: 'boolean'; options: { track: number } }
	track_solo: { type: 'boolean'; options: { track: number } }
	source_no_signal: { type: 'boolean'; options: { source: number } }
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

export function UpdateFeedbacks(self: ModuleInstance): void {
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
	})
}
