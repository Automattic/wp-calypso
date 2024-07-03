const wooCommerceProductSlugMapping: { [ key: string ]: string } = {
	'woocommerce-min-max-quantities': 'jetpack-woocommerce-minmax-quantities',
	'woocommerce-product-addons': 'jetpack-woocommerce-product-add-ons',
};

export const isWooCommerceProduct = ( slug: string, yearlyProductSlug: string ) => {
	if ( slug === yearlyProductSlug ) {
		return true;
	}
	if ( slug === yearlyProductSlug.replace( 'jetpack-', '' ) ) {
		return true;
	}
	if ( slug === yearlyProductSlug.replace( 'jetpack-woocommerce', '' ) ) {
		return true;
	}
	// WooCommerce product slug mapping is used to map the WooCommerce product slug to the correct product slug
	return !! wooCommerceProductSlugMapping?.[ slug ];
};
