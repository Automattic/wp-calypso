/**
 *  format
 *
 * @format
 */

export default {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// todo: does this match everything? thats what i want
		'': { type: 'date-time' },
	},
};
