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
							comments: 'number',
							labelDay: 'string',
							likes: 'number',
							period: 'string',
							postTitles: { type: 'array', items: { type: 'string' } },
							views: 'number',
							visitors: 'number',
						},
					},
				},
			},
		},
	},
};
