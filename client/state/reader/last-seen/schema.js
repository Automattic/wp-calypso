export default {
	type: 'object',
	patternProperties: {
		'\S+': {
			type: 'object',
			properties: {
				token: { type: 'string' },
				updated: { type: 'string' },
			},
		},
	},
};
