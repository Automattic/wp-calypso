export const secureYourBrandSchema = {
	type: 'array',
	domains: {
		type: 'object',
		required: [ 'domain' ],
		properties: {
			domain: { type: 'string' },
			product_id: { type: 'string' },
			product_slug: { type: 'string' },
			cost: { type: 'string' },
		},
	},
};
