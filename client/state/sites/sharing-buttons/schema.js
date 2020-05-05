export const items = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'array',
			items: {
				type: 'object',
			},
		},
	},
};
