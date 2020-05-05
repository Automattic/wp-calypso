export const items = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			additionalProperties: {
				type: 'object',
				required: [ 'name' ],
				properties: {
					name: { type: 'string' },
					label: { type: 'string' },
					labels: { type: 'object' },
					description: { type: 'string' },
					map_meta_cap: { type: 'boolean' },
					capabilities: { type: 'object' },
					api_queryable: { type: 'boolean' },
					hierarchical: { type: 'boolean' },
					supports: { type: 'object' },
				},
			},
		},
	},
};
