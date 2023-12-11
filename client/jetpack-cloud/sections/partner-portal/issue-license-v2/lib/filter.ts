import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

/* check if product matches the search query
 *
 * @param product - product to check
 * @param productSearchQuery - search query to match against
 *
 * @returns boolean - true if product matches the search query, false otherwise
 */
export const isProductMatch = ( product: APIProductFamilyProduct, productSearchQuery: string ) => {
	const nameFilter = ( name: string ) =>
		name.toLowerCase().includes( productSearchQuery.toLowerCase() );

	if ( product.slug.startsWith( 'jetpack-complete' ) ) {
		return [
			product.name,
			'Jetpack VaultPress Backup',
			'Jetpack Scan',
			'Jetpack Akismet Anti-spam',
			'Jetpack VideoPress',
			'Jetpack Boost',
			'Jetpack Social',
			'Jetpack Search',
			'Jetpack Stats',
			'Jetpack CRM',
			'Jetpack Creator',
		].some( nameFilter );
	}

	if ( product.slug.startsWith( 'jetpack-security' ) ) {
		return [
			product.name,
			'Jetpack VaultPress Backup',
			'Jetpack Scan',
			'Jetpack Akismet Anti-spam',
		].some( nameFilter );
	}

	return nameFilter( product.name );
};
