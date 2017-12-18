/** @format */
export const jetpackConnectAuthorizeSchema = {
	type: 'object',
	additionalProperties: false,
	required: [ 'timestamp' ],
	properties: {
		authorizationCode: { type: 'string' },
		authorizeError: { type: 'boolean' },
		authorizeSuccess: { type: 'boolean' },
		clientId: { type: 'integer' },
		isAuthorizing: { type: 'boolean' },
		isRedirectingToWpAdmin: { type: 'boolean' },
		plansUrl: { type: 'string' },
		siteReceived: { type: 'boolean' },
		timestamp: { type: 'integer' },
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
