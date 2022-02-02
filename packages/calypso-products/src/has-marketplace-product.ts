const cleanSlug = ( slug: string ) =>
	slug && slug.replace( /_/g, '-' ).split( /-(monthly|yearly|2y)/ )[ 0 ];

/**
 * Returns true if a list of products contains a marketplace product with the specified product slug.
 *
 * @param {object} productsList - List of products
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {boolean}
 */
export const hasMarketplaceProduct = (
	productsList: Record< string, { product_type: string; product_slug: string } >,
	productSlug: string
): boolean =>
	Object.entries( productsList ).some(
		( [ subscriptionSlug, { product_type } ] ) =>
			cleanSlug( productSlug ) === cleanSlug( subscriptionSlug ) &&
			product_type.startsWith( 'marketplace' )
	);
