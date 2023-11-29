/**
 * Format the string to return variant name
 * @param product Product name
 * @returns Product title
 */
export default function getProductVariantShortTitle( product: string ): string {
	if ( product.includes( '10GB' ) ) {
		return '10GB';
	}

	if ( product.includes( '100GB' ) ) {
		return '100GB';
	}

	if ( product.includes( '1TB' ) ) {
		return '1TB';
	}

	if ( product.includes( '3TB' ) ) {
		return '3TB';
	}

	if ( product.includes( '5TB' ) ) {
		return '5TB';
	}

	return product;
}
