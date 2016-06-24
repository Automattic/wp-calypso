export const productsListSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'.+': {
			type: 'object',
			required: [
				'product_id',
				'product_name',
				'product_slug',
				'description',
				'is_domain_registration',
				'cost_display' ],
			properties: {
				product_id: { type: 'integer' },
				product_name: { type: 'string' },
				product_slug: { type: 'string' },
				description: { type: 'string' },
				cost: { type: 'number' },
				prices: {
					type: 'object',
				},
				is_domain_registration: { type: 'boolean' },
				cost_display: { type: 'string' },
			}
		}
	}
};
