export const statesListSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'.+': {
			type: 'array',
			required: [
				'code',
				'name',
			],
			properties: {
				code: { type: 'string' },
				name: { type: 'string' },
			}
		}
	}
};
