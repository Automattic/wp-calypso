export const itemsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'array',
			items: {
				type: 'object',
				term_id: { type: 'integer' },
				name: { type: 'string' },
				slug: { type: 'string' },
				description: { type: 'string' },
			}
		}
	}
};
