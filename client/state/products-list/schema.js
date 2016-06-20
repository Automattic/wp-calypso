export const productsListSchema = {
	type: 'object',
	required: [ 'product_id' ],
	patternProperties: {
		'.+': {
			type: 'object',
			required: [
				'product_id',
				'product_name',
				'product_slug',
				'description',
				'cost',
				'is_domain_registration',
				'cost_display' ],
			properties: {
				product_id: { type: 'integer' },
				product_name: { type: 'string' },
				product_slug: { type: 'string' },
				description: { type: 'string' },
				cost: { type: 'integer' },
				prices: {
					type: 'object',
					patternProperties: {
						'^[A-Z]+$': { type: 'integer' }
					}
				},
				is_domain_registration: { type: 'boolean' },
				cost_display: { type: 'string' },
			}
		}
	},
	additionalProperties: false
};
