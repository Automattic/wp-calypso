/**
 * Provided a license key or a product slug, can we trust that the product is a Pressable hosting product
 * @param keyOrSlug string
 * @returns boolean True if Pressable hosting product, false if not
 */
export default function isPressableHostingProduct( keyOrSlug: string ) {
	return keyOrSlug.startsWith( 'pressable-hosting' );
}
