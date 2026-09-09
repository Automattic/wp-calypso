import { getProductDescription } from './product-descriptions';
import { getStorePlan } from './product-info';
import type { AgencyProduct } from '@automattic/api-core';

// Turns a store slug such as `jetpack_backup_t1_yearly` into the name a user
// would search for, the way the classic search does.
function getProductNameBySlug( slug: string ): string {
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

// Plans (Complete, Security, Growth, Starter) also match a search for any product
// they bundle.
function getIncludedProductNames( product: AgencyProduct ): string[] {
	return ( getStorePlan( product.slug )?.getProductsIncluded?.() ?? [] ).map(
		getProductNameBySlug
	);
}

export function getProductSearchText( product: AgencyProduct ): string {
	return [
		product.name,
		...getProductDescription( product.slug ).features,
		...getIncludedProductNames( product ),
	].join( ' ' );
}
