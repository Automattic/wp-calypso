export const connectionsSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			required: [ 'ID', 'site_ID' ],
			properties: {
				ID: { type: 'integer' },
				site_ID: { type: 'integer' },
				user_ID: { type: 'integer' },
				keyring_connection_ID: { type: 'integer' },
				keyring_connection_user_ID: { type: 'integer' },
				shared: { type: 'boolean' },
				service: { type: 'string' },
				label: { type: 'string' },
				issued: { type: 'string' },
				expires: { type: 'string' },
				external_ID: { type: [ 'string', 'null' ] },
				external_name: { type: [ 'string', 'null' ] },
				external_display: { type: [ 'string', 'null' ] },
				external_profile_picture: { type: [ 'string', 'null' ] },
				external_profile_URL: { type: [ 'string', 'null' ] },
				external_follower_count: { type: [ 'integer', 'null' ] },
				status: { type: 'string' },
				refresh_URL: { type: 'string' },
				meta: { type: 'object' }
			}
		}
	},
	additionalProperties: false
};
