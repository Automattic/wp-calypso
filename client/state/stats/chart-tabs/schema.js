/** @format */
export const counts = {
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

export const isLoading = {
	type: 'object',
	// additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			// additionalProperties: false,
			patternProperties: {
				// Stat field type, such as 'views' or 'post_likes'
				'^\\w+$': {
					type: 'object',
					patternProperties: {
						// Period type, such as 'day' or 'week'
						'^\\w+$': {
							type: 'boolean',
						},
					},
				},
			},
		},
	},
};
