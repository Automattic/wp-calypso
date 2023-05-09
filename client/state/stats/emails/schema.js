export const items = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			additionalProperties: false,
			patternProperties: {
				// Email Id
				'^\\d+$': {
					type: 'object',
				},
			},
		},
	},
};
