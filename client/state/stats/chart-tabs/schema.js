export const countsSchema = {
	type: 'object',
	// additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			// additionalProperties: false,
			patternProperties: {
				// Period type, such as 'day' or 'week'
				'^\\w+$': {
					type: 'array',
					items: {
						type: 'object',
						required: [ 'period', 'labelDay' ],
						properties: {
							classNames: { type: 'array', items: { type: 'string' } },
							comments: { type: 'number' },
							labelDay: { type: 'string' },
							likes: { type: 'number' },
							period: { type: 'string' },
							postTitles: { type: 'array', items: { type: 'string' } },
							views: { type: 'number' },
							visitors: { type: 'number' },
						},
					},
				},
			},
		},
	},
};
