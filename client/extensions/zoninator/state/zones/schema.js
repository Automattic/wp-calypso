export const itemsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: true,
				name: { type: 'string' },
				slug: { type: 'string' },
				description: { type: 'string' },
			}
		}
	}
};
