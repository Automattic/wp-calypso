/**
 * Provided a license key or a product slug, can we trust that the product is a Jetpack CRM product (includes bundles and Jetpack Complete).
 *
 * NOTE: For now we are only validating jetpack-complete purchases, as jetpack crm licenses are in a different format (i.e.: XXXX-XXXX-XXXX-XXXX-XXXX).
 *
 * @param keyOrSlug string
 * @returns boolean True if Jetpack CRM product, false if not
 */
export default function isJetpackCrmProduct( keyOrSlug: string ) {
	return (
		keyOrSlug.startsWith( 'jetpack-complete' ) ||
		keyOrSlug.startsWith( 'jetpack_complete' ) ||
		keyOrSlug.startsWith( 'jetpack-crm' ) ||
		keyOrSlug.startsWith( 'jetpack_crm' )
	);
}
