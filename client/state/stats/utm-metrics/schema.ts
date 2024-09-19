export const schema = {
	type: 'object',
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			properties: {
				metrics: {
					type: 'array',
					items: {
						type: 'object',
						required: [ 'label', 'value' ],
						properties: {
							source: { type: 'string' },
							medium: { type: 'string' },
							label: { type: 'string' },
							value: { type: 'number' },
							paramValues: { type: 'string' },
						},
					},
				},
				metricsByPost: {
					type: 'object',
					patternProperties: {
						// Post Id
						'^\\d+$': {
							type: 'array',
							items: {
								type: 'object',
								required: [ 'label', 'value' ],
								properties: {
									source: { type: 'string' },
									medium: { type: 'string' },
									label: { type: 'string' },
									value: { type: 'number' },
								},
							},
						},
					},
				},
				topPosts: {
					type: 'object',
					patternProperties: {
						// UTM parameter values
						'^\\w+$': {
							type: 'array',
							items: {
								type: 'object',
								required: [ 'id', 'label', 'value' ],
								properties: {
									id: { type: 'number' },
									label: { type: 'string' },
									value: { type: 'number' },
									href: { type: 'string' },
								},
							},
						},
					},
				},
			},
		},
	},
};
