export const jetpackConnectSessionsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^[a-z0-9\.\-\:]+$': {
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
