/**
 * Provided a license key or a product slug, can we trust that the product is a WordPress.com hosting product
 * @param keyOrSlug string
 * @returns boolean True if wpcom hosting product, false if not
 */
export default function isWpcomHostingProduct( keyOrSlug: string ) {
	return keyOrSlug.startsWith( 'wpcom-hosting' );
}
