export const itemsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			patternProperties: {
				'^\\d+$': {
					type: 'object',
					properties: {
						id: { type: 'integer' },
						name: { type: 'string' },
						slug: { type: 'string' },
						description: { type: 'string' },
					},
				},
			},
		},
	},
};
