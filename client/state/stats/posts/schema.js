export const items = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			additionalProperties: false,
			patternProperties: {
				// Post Id
				'^\\d+$': {
					type: 'object',
				},
			},
		},
	},
};
