import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import getProductInfo from '../../../lib/get-product-info';

// Helper function to get the product name from the product slug. Only applicable for this filter logic.
function getProductNameBySlug( slug: string ) {
	if ( slug.startsWith( 'jetpack_anti_spam' ) ) {
		return 'Jetpack Akismet Anti-spam';
	}

	if ( slug.startsWith( 'jetpack_backup_t1' ) ) {
		return 'Jetpack VaultPress Backup 10GB';
	}

	if ( slug.startsWith( 'jetpack_backup_t2' ) ) {
		return 'Jetpack VaultPress Backup 1TB';
	}

	return slug
		.replace( /t1|t2|monthly|yearly/g, '' )
		.replace( /_/g, ' ' )
		.trim();
}

/* Check if product matches the search query.
 *
 * @param product - product to check
 * @param productSearchQuery - search query to match against
 *
 * @returns boolean - true if product matches the search query, false otherwise
 */
export const isProductMatch = ( product: APIProductFamilyProduct, productSearchQuery: string ) => {
	const nameFilter = ( name: string ) =>
		name.toLowerCase().includes( productSearchQuery.toLowerCase() );

	const productInfo = getProductInfo( product.slug );

	if ( productInfo?.productsIncluded?.length ) {
		return [ product.name, ...productInfo.productsIncluded.map( getProductNameBySlug ) ].some(
			nameFilter
		);
	}

	return nameFilter( product.name );
};
