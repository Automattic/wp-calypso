/**
 * Provided a license key or a product slug, checks if it looks like the product is a Jetpack CRM product (includes bundles, Jetpack Complete and Jetpack Pro).
 * @param keyOrSlug string
 * @returns boolean Returns true if keyOrSlug looks like a Jetpack CRM product license key or slug, false if not
 */
export default function isJetpackCrmProduct( keyOrSlug?: string ) {
	if ( ! keyOrSlug ) {
		return false;
	}

	return (
		keyOrSlug.startsWith( 'jetpack-complete' ) ||
		keyOrSlug.startsWith( 'jetpack_complete' ) ||
		keyOrSlug.startsWith( 'jetpack-pro_' ) ||
		keyOrSlug.startsWith( 'jetpack_pro_' ) ||
		keyOrSlug.startsWith( 'jetpack-crm' ) ||
		keyOrSlug.startsWith( 'jetpack_crm' )
	);
}
