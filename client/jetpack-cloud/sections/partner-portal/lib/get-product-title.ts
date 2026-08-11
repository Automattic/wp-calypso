/**
 * Format the string by removing Jetpack, (, ) from the product name
 * @param product Product name
 * @param removeVariant if we need to remove variant information
 * @returns Product title
 */
export default function getProductTitle( product: string, removeVariant: boolean = false ): string {
	if ( 'Jetpack AI' === product || 'Jetpack AI Assistant' === product ) {
		return 'AI';
	}

	// The store catalog renamed this product; both names are served until the rename ships (STATS-426).
	if ( 'Jetpack Stats (Paid)' === product || 'Jetpack Stats (Commercial license)' === product ) {
		return 'Stats';
	}

	if ( removeVariant && product.startsWith( 'Jetpack Security' ) ) {
		return 'Security';
	}

	if ( removeVariant && product.startsWith( 'Jetpack VaultPress Backup' ) ) {
		return 'VaultPress Backup';
	}

	return product.replace( /(?:Jetpack\s|[)(])/gi, '' );
}
