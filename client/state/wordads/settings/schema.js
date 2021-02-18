export const items = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site ID
		'^\\d+$': {
			type: 'object',
		},
	},
};
