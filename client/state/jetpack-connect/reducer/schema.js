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
				authorizeError: {
					anyOf: [
						{
							type: 'object',
							properties: {
								error: { type: 'string' },
								message: { type: 'string' },
								status: { type: 'integer' },
							},
						},
						{ type: 'boolean' },
						{ type: 'null' },
					],
				},
				authorizeSuccess: { type: 'boolean' },
				clientId: { type: 'integer' },
				clientNotResponding: { type: 'boolean' },
				isAuthorizing: { type: 'boolean' },
				plansUrl: { type: 'string' },
				siteReceived: { type: 'boolean' },
				timestamp: { type: 'integer' },
				userAlreadyConnected: { type: 'boolean' },
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
