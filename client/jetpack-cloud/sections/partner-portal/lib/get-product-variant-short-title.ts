/**
 * Format the string to return variant name
 * @param product Product name
 * @returns Product title
 */
export default function getProductVariantShortTitle( product: string ): string {
	const match = product.match( /(\d+(?:GB|TB))/ );
	return match ? match[ 1 ] : product;
}
