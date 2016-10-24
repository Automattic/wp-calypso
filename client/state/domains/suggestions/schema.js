export const itemsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Queries are JSON strings
		'^\\{[^\\}]*\\}$': {
			type: 'array',
			items: {
				type: 'object',
				required: [ 'domain_name' ],
				properties: {
					domain_name: { type: 'string' },
					cost: { type: 'string' },
					product_id: { type: 'integer' },
					product_slug: { type: 'string' }
				}
			}
		}
	}
};
