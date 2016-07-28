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

export const queriesSchema = {
	type: 'object',
	patternProperties: {
		// Site ID
		'^\\d+$': {
			// Serialized QueryManager is a JSON string
			type: 'string',
			pattern: '^\\{.*\\}$'
		}
	},
	additionalProperties: false
};
