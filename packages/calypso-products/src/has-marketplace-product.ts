/**
 * Returns true if a list of products contains a marketplace product with a matching product or store product slug.
 *
 * @param {object} productsList - List of products
 * @param {string} productSlug - internal product slug e.g. woocommerce-product-csv-import-suite or store product slug, e.g wc_product_csv_import_suite_yearly
 * @returns {boolean}
 */
export const hasMarketplaceProduct = (
	productsList: Record< string, { product_type: string; billing_product_slug: string } >,
	productSlug: string
): boolean =>
	Object.entries( productsList ).some(
		( [ subscriptionSlug, { product_type, billing_product_slug } ] ) =>
			( productSlug === subscriptionSlug || productSlug === billing_product_slug ) &&
			// additional type check needed when called from JS context
			typeof product_type === 'string' &&
			product_type.startsWith( 'marketplace' )
	);
