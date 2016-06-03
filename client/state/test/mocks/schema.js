export const testSchema = {
	type: 'object',
	patternProperties: {
		test: {
			type: 'array',
			items: {
				type: 'string'
			}
		}
	},
	additionalProperties: false
};
