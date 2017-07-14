export const items = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			additionalProperties: false,
			patternProperties: {
				// date + period + num
				'^\\d{4}-\\d{2}-\\d{2}(?:day|week|month|year)\\d+$': {
					type: 'object',
					additionalProperties: false,
					patternProperties: {
						// date (each day)
						'^\\d{4}-\\d{2}-\\d{2}$': {
							type: 'object',
							additionalProperties: false,
							properties: {
								postviews: {
									type: 'array',
									items: {
										type: 'object',
										additionalProperties: false,
										properties: {
											date: { type: 'string' },
											href: { type: 'string' },
											id: { type: 'integer' },
											title: { type: 'string' },
											type: { type: 'string' },
											video_play: { type: 'boolean' },
											views: { type: 'integer' },
										},
									},
								},
								total_views: { type: 'integer' },
							},
						},
					},
				},
			},
		},
	},
};
