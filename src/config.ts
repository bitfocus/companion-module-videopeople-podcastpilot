import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = {
	host: string
	port: number
	token: string
	levels: boolean
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			label: 'PodcastPilot',
			width: 12,
			value:
				'Enable the control API in PodcastPilot under Settings → Remote. ' +
				'Running Companion on the same Mac: use 127.0.0.1 and leave the token empty. ' +
				'Running on another machine: enable "Allow connections from other devices" in the app and paste the token shown there.',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Host',
			width: 8,
			default: '127.0.0.1',
			regex: Regex.HOSTNAME,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Port',
			width: 4,
			min: 1024,
			max: 65535,
			default: 9720,
		},
		{
			type: 'textinput',
			id: 'token',
			label: 'Token (only when connecting over the network)',
			width: 8,
			default: '',
		},
		{
			type: 'checkbox',
			id: 'levels',
			label: 'Track levels as variables (10 Hz)',
			width: 4,
			default: false,
		},
	]
}
