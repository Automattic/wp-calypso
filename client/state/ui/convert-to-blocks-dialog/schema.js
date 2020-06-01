export const schema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			additionalProperties: false,
			patternProperties: {
				// Post ID
				'^\\d+$': { type: 'string' },
			},
		},
	},
};
