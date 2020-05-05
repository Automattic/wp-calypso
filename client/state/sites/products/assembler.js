export const createSiteProductObject = ( product ) => {
	if ( ! product ) {
		return {};
	}

	product.cost = Number( product.cost );
	return product;
};
