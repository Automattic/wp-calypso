/**
 * External dependencies
 */

export const createPlanObject = plan => {
	return {
		androidSku: String( plan.android_sku ),
		appleSku: String( plan.apple_sku ),
		available: String( plan.available ),
		billPeriod: Number( plan.bill_period ),
		billPeriodLabel: String( plan.bill_period_label ),
		cost: Number( plan.cost ),
		capability: String( plan.capability ),
		description: String( plan.description ),
		featuresHighlight: 'object' === typeof plan.features_highlight
			? Object( plan.features_highlight )
			: null,
		formattedPrice: String( plan.formatted_price ),
		icon: String( plan.icon ),
		iconActive: String( plan.icon_active ),
		price: String( plan.price ),
		prices: Object( plan.prices ),
		productId: Number( plan.product_id ),
		productName: String( plan.product_name ),
		productNameEn: String( plan.product_name_en ),
		productNameShort: String( plan.product_name_short ),
		productSlug: String( plan.product_slug ),
		productType: String( plan.product_type ),
		rawPrice: Number( plan.raw_price ),
		shortdesc: String( plan.shortdesc ),
		store: 'number' === typeof plan.store ? Number( plan.store ) : null,
		tagline: String( plan.tagline )
	};
};
