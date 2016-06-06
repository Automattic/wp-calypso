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
				queryObject: {
					type: 'object',
					properties: {
						_wp_nonce: { type: 'string' },
						client_id: { type: 'string' },
						from: { type: 'string' },
						jp_version: { type: 'string' },
						redirect_after_auth: { type: 'string' },
						redirect_uri: { type: 'string' },
						scope: { type: 'string' },
						secret: { type: 'string' },
						site: { type: 'string' },
						state: { type: 'string' }
					}
				},
				siteReceived: { type: 'boolean' }
			},
			additionalProperties: false
		}
	}
};
