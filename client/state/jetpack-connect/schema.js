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

export const jetpackConnectAuthorizeSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^.+$': {
			type: 'object',
			required: [ 'queryObject' ],
			properties: {
				activateManageSecret: { type: 'string' },
				authorizeError: { type: 'boolean' },
				authorizeSuccess: { type: 'boolean' },
				autoAuthorize: { type: 'boolean' },
				isActivating: { type: 'boolean' },
				isAuthorizing: { type: 'boolean' },
				isRedirectingToWpAdmin: { type: 'boolean' },
				manageActivated: { type: 'boolean' },
				manageActivatedError: { type: 'boolean' },
				plansUrl: { type: 'string' },
				queryObject: { type: 'object' },
				siteReceived: { type: 'boolean' }
			},
			additionalProperties: false
		}
	}
};
