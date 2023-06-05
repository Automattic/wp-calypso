export const schema = {
	type: 'object',
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			patternProperties: {
				// page key, such as 'traffic'
				traffic: {
					type: 'object',
					patternProperties: {
						// module key, such as 'highlights'
						highlights: {
							type: 'object',
							patternProperties: {
								// option key, such as 'period_in_days'
								period_in_days: { type: 'number' },
							},
						},
					},
				},
			},
		},
	},
};
