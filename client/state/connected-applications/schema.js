export default {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			ID: { type: 'string' },
			URL: { type: 'string' },
			authorized: { type: 'string' },
			description: { type: 'string' },
			icon: { type: 'string' },
			permissions: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						description: { type: 'string' },
						name: { type: 'string' },
					},
					required: [ 'description', 'name' ],
					additionalProperties: false,
				},
			},
			scope: { type: 'string' },
			site: {
				oneOf: [
					{
						type: 'boolean',
					},
					{
						type: 'object',
						properties: {
							site_ID: { type: 'string' },
							site_URL: { type: 'string' },
							site_name: { type: [ 'string', 'boolean' ] },
						},
						required: [ 'site_ID', 'site_URL', 'site_name' ],
						additionalProperties: false,
					},
				],
			},
			title: { type: 'string' },
		},
		required: [ 'ID' ],
		additionalProperties: false,
	},
};
