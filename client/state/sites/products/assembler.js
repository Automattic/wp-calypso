export const createSiteProductObject = ( product ) => {
	if ( ! product ) {
		return {};
	}

	product.cost = Number( product.cost );
	product.tierUsage = Number( product.price_tier_usage_quantity );
	return product;
};
