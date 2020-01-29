export const itemSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^[a-z]{2}$': {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					code: {
						type: 'string',
					},
					name: {
						type: 'string',
					},
				},
				required: [ 'code', 'name' ],
			},
		},
	},
};
