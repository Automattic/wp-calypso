export const itemsSchema = {
	type: 'object',
	patternProperties: {
		// Site ID
		'^[0-9]+$': {
			type: 'object',
			patternProperties: {
				// Post Type
				'^.*$': {
					type: 'array',
					items: {
						type: 'object',
						required: [ 'name' ],
						properties: {
							name: { type: 'string' },
							label: { type: 'string' },
							labels: { type: 'object' },
							description: { type: 'string' },
							hierarchical: { type: 'boolean' },
							public: { type: 'boolean' },
							capabilities: { type: 'object' },
						},
					},
				},
			},
			additionalProperties: false,
		},
	},
	additionalProperties: false,
};
