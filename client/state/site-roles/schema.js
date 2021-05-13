export const siteRolesSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: { type: 'string' },
					display_name: { type: 'string' },
					capabilities: {
						type: 'object',
						patternProperties: {
							'^.+$': { type: 'boolean' },
						},
					},
				},
				required: [ 'name', 'display_name', 'capabilities' ],
			},
		},
	},
};
