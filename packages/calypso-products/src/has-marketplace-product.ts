/**
 * Returns true if a list of products includes a product with a matching product or store product slug.
 *
 * @param {Object} productsList - List of products
 * @param {string} searchSlug - Either a product slug e.g. woocommerce-product-csv-import-suite or store product slug, e.g wc_product_csv_import_suite_yearly
 * @returns {boolean}
 */
export const hasMarketplaceProduct = (
	productsList: Record< string, { product_type: string; billing_product_slug: string } >,
	searchSlug: string
): boolean =>
	// storeProductSlug is from the legacy store_products system, billing_product_slug is from
	// the non-legacy billing system and for marketplace plugins will match the slug of the plugin
	// by convention.
	Object.entries( productsList ).some(
		( [ storeProductSlug, { product_type, billing_product_slug } ] ) =>
			( searchSlug === storeProductSlug || searchSlug === billing_product_slug ) &&
			// additional type check needed when called from JS context
			typeof product_type === 'string' &&
			// SaaS products are also considered marketplace products
			( product_type.startsWith( 'marketplace' ) || product_type === 'saas_plugin' )
	);
