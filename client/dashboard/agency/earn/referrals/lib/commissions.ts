// The commission rules are also implemented in the backend, which computes the
// actual payouts. TODO: Expose them via an API endpoint so there is a single
// source of truth; until then, keep this file in sync with the backend.
export const isProductEligibleForCommission = ( slug: string ) => {
	const thirdPartyProducts = [
		'woocommerce-affirm',
		'woocommerce-afterpay',
		'woocommerce-constellation',
		'woocommerce-dynamic-pricing',
		'woocommerce-klarna',
		'woocommerce-klaviyo',
		'woocommerce-mollie',
		'woocommerce-paypal',
		'woocommerce-rental-products',
		'woocommerce-smart-coupons',
		'woocommerce-square',
		'woocommerce-stripe',
		'woocommerce-variation-swatches-and-photos',
	];

	if ( thirdPartyProducts.includes( slug ) ) {
		return false;
	}
	return true;
};

export const getProductCommissionPercentage = ( slug?: string, familySlug?: string ) => {
	if ( ! slug || ! familySlug || ! isProductEligibleForCommission( slug ) ) {
		return 0;
	}
	if ( [ 'wpcom-hosting', 'pressable-hosting' ].includes( familySlug ) ) {
		return 0.2;
	}
	if ( slug.startsWith( 'jetpack-' ) || slug.startsWith( 'woocommerce-' ) ) {
		return 0.5;
	}
	return 0;
};
