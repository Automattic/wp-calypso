export const secureYourBrandSchema = {
	type: 'object',
	properties: {
		product_data: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					domain: { type: 'string' },
					product_id: { type: 'number' },
					product_slug: { type: 'string' },
					cost: { type: 'number' },
					currency: { type: 'string' },
				},
				required: [ 'domain', 'product_id', 'product_slug', 'cost', 'currency' ],
				additionalProperties: false,
			},
		},
		currency: { type: 'string' },
		discounted_cost: { type: 'number' },
		total_cost: { type: 'number' },
	},
};
