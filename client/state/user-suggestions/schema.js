export const itemsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'array',
			items: {
				type: 'object',
				required: [ 'ID', 'user_login' ],
				properties: {
					ID: { type: 'integer' },
					display_name: { type: 'string' },
					image_URL: { type: 'string' },
					source: {
						type: 'array',
						items: { type: 'string' },
					},
					user_login: { type: 'string' },
				},
			},
		},
	},
};
