/**
 * Format the string by removing Jetpack, (, ) from the product name
 * @param product Product name
 * @returns Product title
 */
export default function getProductTitle( product: string ): string {
	if ( 'Jetpack AI' === product ) {
		return 'AI Assistant';
	}

	if ( 'Jetpack Stats (Commercial license)' === product ) {
		return 'Stats';
	}

	return product.replace( /(?:Jetpack\s|[)(])/gi, '' );
}
