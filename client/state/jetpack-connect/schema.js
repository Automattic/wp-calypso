export const jetpackConnectSessionsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^.+$': {
			type: 'object',
			required: [ 'timestamp' ],
			properties: {
				timestamp: { type: 'number' },
				isInstall: { type: 'boolean' }
			},
			additionalProperties: false
		}
	}
};
