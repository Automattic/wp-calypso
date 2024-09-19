export const schema = {
	type: 'object',
	patternProperties: {
		// Site ID
		'^\\d+$': {
			type: 'object',
			properties: {
				recent_usages: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							views_count: {
								type: 'integer',
							},
						},
						required: [ 'views_count' ],
						additionalProperties: true,
					},
				},
			},
			required: [ 'recent_usages' ],
			additionalProperties: true,
		},
	},
	additionalProperties: false,
};
