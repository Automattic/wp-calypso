export const itemSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			required: [ 'ID' ],
			properties: {
				ID: { type: 'integer' },
				additional_external_users: { type: 'array' },
				expires: { type: [ 'number', 'boolean' ] },
				external_ID: { type: [ 'string', 'null' ] },
				external_display: { type: [ 'string', 'null' ] },
				external_name: { type: [ 'string', 'null' ] },
				external_profile_picture: { type: [ 'string', 'null' ] },
				issued: { type: 'string' },
				label: { type: 'string' },
				meta: { type: 'object' },
				refresh_URL: { type: 'string' },
				service: { type: 'string' },
				sites: { type: 'array' },
				status: { type: 'string' },
				type: { type: 'string' },
				user_ID: { type: 'integer' },
			},
		},
	},
};
