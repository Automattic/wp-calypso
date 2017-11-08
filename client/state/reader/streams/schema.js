/** @format */

export const itemsSchema = {
	type: 'object',
	patternProperties: {
		'(w|d)+': {
			type: 'array',
		},
	},
	additionalProperties: false,
};
