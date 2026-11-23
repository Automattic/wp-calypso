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
			},
		},
	},
};
