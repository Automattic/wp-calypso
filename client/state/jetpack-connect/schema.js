export const jetpackConnectSessionsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^.+$': {
			type: 'object',
			required: [ 'timestamp' ],
			properties: {
				timestamp: { type: 'number' },
				flowType: { type: 'string' }
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
					required: [ '_wp_nonce', 'client_id', 'redirect_uri', 'scope', 'secret', 'site', 'state' ],
					properties: {
						_wp_nonce: { type: 'string' },
						client_id: { type: 'string' },
						from: { type: 'string' },
						home_url: { type: 'string' },
						jp_version: { type: 'string' },
						new_user_started_connection: { type: 'boolean' },
						redirect_after_auth: { type: 'string' },
						redirect_uri: { type: 'string' },
						scope: { type: 'string' },
						secret: { type: 'string' },
						site: { type: 'string' },
						site_icon: { type: 'string' },
						site_url: { type: 'string' },
						state: { type: 'string' }
					},
					additionalProperties: false
				},
				siteReceived: { type: 'boolean' }
			},
			additionalProperties: false
		}
	}
};
