export const schema = {
	type: 'object',
	patternProperties: {
		// Site ID
		'^\\d+$': {
			type: 'object',
			properties: {
				view: { type: 'boolean' },
				statType: { type: 'string' },
			},
			required: [ 'view', 'statType' ],
			additionalProperties: false,
		},
	},
	additionalProperties: false,
};
