/**
 * Check if there are more than 1 product type slugs
 * @param productSlugs An array of product slugs for each product type
 * @returns boolean Whether there are more than multiple product type slugs
 */
export function hasMultipleProductTypes( productSlugs: Array< string[] > ): boolean {
	const nonEmptyProductSlugs = productSlugs.filter( ( slugs ) => slugs.length !== 0 );

	return nonEmptyProductSlugs.length > 1;
}
