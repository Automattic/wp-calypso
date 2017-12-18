/** @format */
export const jetpackConnectAuthorizeSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^.+$': {
			type: 'object',
			required: [ 'timestamp' ],
			properties: {
				authorizationCode: { type: 'string ' },
				authorizeError: { type: 'boolean' },
				authorizeSuccess: { type: 'boolean' },
				isAuthorizing: { type: 'boolean' },
				isRedirectingToWpAdmin: { type: 'boolean' },
				plansUrl: { type: 'string' },
				timestamp: { type: 'integer' },
				siteReceived: { type: 'boolean' },
				clientId: { type: 'integer' },
			},
			additionalProperties: false,
		},
	},
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
