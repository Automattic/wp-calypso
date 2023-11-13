/**
 * Provided a license key or a product slug, can we trust that the product is a WooCommerce product
 * @param keyOrSlug string
 * @returns boolean True if WC product, false if not
 */
export default function isWooCommerceProduct( keyOrSlug: string ) {
	return keyOrSlug.startsWith( 'woocommerce' );
}
