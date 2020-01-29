export const productsListSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'.+': {
			type: 'object',
			required: [
				'available',
				'product_id',
				'product_name',
				'product_slug',
				'description',
				'is_domain_registration',
				'cost_display',
			],
			properties: {
				available: { type: 'boolean' },
				product_id: { type: 'integer' },
				product_name: { type: 'string' },
				product_slug: { type: 'string' },
				description: { type: 'string' },
				cost: { type: [ 'number', 'null' ] },
				prices: {
					type: 'object',
				},
				is_domain_registration: { type: 'boolean' },
				cost_display: { type: 'string' },
			},
		},
	},
};
