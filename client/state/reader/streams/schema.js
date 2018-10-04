/** @format */

export default {
	type: 'object',
	patternProperties: {
		'(\\w|\\d)+': {
			type: 'object',
			properties: {
				items: { type: 'array' },
				selected: { type: 'object' },
				pendingItems: { type: 'object' },
				lastPage: { type: 'boolean' },
				isRequesting: { type: 'boolean' },
				pageHandle: { type: 'string' },
			},
			additionalProperties: false,
		},
	},
	additionalProperties: false,
};
