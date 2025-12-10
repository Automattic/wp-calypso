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
				error: { type: 'object' },
			},
			additionalProperties: false,
		},
	},
	additionalProperties: false,
};
