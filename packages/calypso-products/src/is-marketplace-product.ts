export function isMarketplaceProduct( productSlug: string ): boolean {
	// Temporary return specific product until https://github.com/Automattic/wp-calypso/issues/56349 is merged.
	return productSlug === 'woocommerce_subscriptions_monthly';
}
