export const itemsSchema = {
	type: 'object',
	patternProperties: {
		'^\\w+$': {
			type: 'array',
			items: {
				type: 'number'
			},
			minItems: 2,
			maxItems: 2
		}
	},
	additionalProperties: false
};
