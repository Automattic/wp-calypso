/** @format */
export const jetpackConnectSessionsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^.+$': {
			type: 'object',
			required: [ 'timestamp' ],
			properties: {
				timestamp: { type: 'number' },
				flowType: { type: 'string' },
			},
			additionalProperties: false,
		},
	},
};

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
				autoAuthorize: { type: 'boolean' },
				isAuthorizing: { type: 'boolean' },
				isRedirectingToWpAdmin: { type: 'boolean' },
				plansUrl: { type: 'string' },
				timestamp: { type: 'number' },
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
			attempt: { type: 'number' },
			timestamp: { type: 'number' },
		},
	},
};
