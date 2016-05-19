export const jetpackConnectSessionsSchema = {
	type: 'object',
	patternProperties: {
		'/^[a-z0-9-:]+$/': {
			type: 'object',
			required: [ 'timestamp' ],
			properties: {
				timestamp: { type: 'number' },
				isInstall: { type: 'boolean' }
			}
		}
	}
};
