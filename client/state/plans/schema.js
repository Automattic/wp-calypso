export const itemsSchema = {
	type: 'array',
	items: {
		type: 'object',
		required: [ 'productId' ],
		properties: {
			androidSku: { type: 'string' },
			appleSku: { type: 'string' },
			available: { type: 'string' },
			billPeriod: { type: 'number' },
			billPeriodLabel: { type: 'string' },
			cost: { type: 'number' },
			capability: { type: 'string' },
			description: { type: 'string' },
			featuresHighlight: { type: [ 'null', 'array' ] },
			formattedPrice: { type: 'string' },
			icon: { type: 'string' },
			iconActive: { type: 'string' },
			price: { type: 'string' },
			prices: { type: 'object' },
			productId: { type: 'number' },
			productName: { type: 'string' },
			productNameEn: { type: 'string' },
			productNameShort: { type: 'string' },
			productSlug: { type: 'string' },
			productType: { type: 'string' },
			rawPrice: { type: 'number' },
			shortdesc: { type: 'string' },
			store: { type: [ 'number', 'null' ] },
			tagline: { type: 'string' }
		},

		additionalProperties: false
	}
};
