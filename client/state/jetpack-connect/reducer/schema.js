/** @format */
export const jetpackConnectAuthorizeSchema = {
	anyOf: [
		{
			type: 'object',
			additionalProperties: false,
			properties: {},
		},
		{
			type: 'object',
			additionalProperties: true,
			required: [ 'timestamp' ],
			properties: {
				authorizationCode: { type: 'string' },
				authorizeError: { type: [ 'boolean', 'null' ] },
				authorizeSuccess: { type: 'boolean' },
				bearerToken: { type: 'string' },
				clientId: { type: 'integer' },
				clientNotResponding: { type: 'boolean' },
				isAuthorizing: { type: 'boolean' },
				plansUrl: { type: 'string' },
				siteReceived: { type: 'boolean' },
				timestamp: { type: 'integer' },
				userAlreadyConnected: { type: 'boolean' },
				userData: { type: 'object' },
			},
		},
	],
};

export const jetpackAuthAttemptsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^.+$': {
			type: 'object',
			additionalProperties: false,
			required: [ 'attempt', 'timestamp' ],
			properties: {
				attempt: {
					type: 'integer',
					minimum: 0,
				},
				timestamp: { type: 'integer' },
			},
		},
	},
};
