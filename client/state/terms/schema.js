export const queriesSchema = {
	type: 'object',
	patternProperties: {
		// Site ID
		'^\\d+$': {
			type: 'object',
			patternProperties: {
				// Taxonomy
				'^[A-Za-z0-9-_]+$': {
					// Serialized TermQueryManager is a JSON string
					type: 'string',
					pattern: '^\\{.*\\}$'
				}
			},
			additionalProperties: false
		}
	},
	additionalProperties: false
};
