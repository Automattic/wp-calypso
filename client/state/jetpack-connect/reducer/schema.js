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
				isRedirectingToWpAdmin: { type: 'boolean' },
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
			required: [ 'attempt', 'timestamp' ],
			attempt: { type: 'integer' },
			timestamp: { type: 'integer' },
		},
	},
};
