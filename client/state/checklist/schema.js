/** @format */
export default {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
		},
	},
};
