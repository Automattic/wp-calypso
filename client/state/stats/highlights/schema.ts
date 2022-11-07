export const schema = {
	type: 'object',
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			patternProperties: {
				counts: {
					type: 'object',
					patternProperties: {
						comments: { type: 'number' },
						likes: { type: 'number' },
						views: { type: 'number' },
						visitors: { type: 'number' },
					},
				},
			},
		},
	},
};
