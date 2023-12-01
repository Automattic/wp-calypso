/**
 * Format the string by removing Jetpack, (, ) from the product name
 * @param product Product name
 * @param removeVariant if we need to remove variant information
 * @returns Product title
 */
export default function getProductTitle( product: string, removeVariant: boolean = false ): string {
	if ( 'Jetpack AI' === product ) {
		return 'AI Assistant';
	}

	if ( 'Jetpack Stats (Commercial license)' === product ) {
		return 'Stats';
	}

	if ( removeVariant && product.startsWith( 'Jetpack Security' ) ) {
		return 'Security';
	}

	return product.replace( /(?:Jetpack\s|[)(])/gi, '' );
}
