import { BACKUP_STORAGE_FAMILY_SLUG } from './product-slugs';
import type { AgencyProduct } from '@automattic/api-core';

// Strips the brand and parentheses from a product name, as the classic list does.
export function getProductTitle( name: string, removeVariant = false ): string {
	if ( name === 'Jetpack AI' || name === 'Jetpack AI Assistant' ) {
		return 'AI';
	}
	if ( name === 'Jetpack Stats (Paid)' ) {
		return 'Stats';
	}
	if ( removeVariant && name.startsWith( 'Jetpack Security' ) ) {
		return 'Security';
	}
	if ( removeVariant && name.startsWith( 'Jetpack VaultPress Backup' ) ) {
		return 'VaultPress Backup';
	}
	return name.replace( /(?:Jetpack\s|[)(])/gi, '' );
}

// Backup storage add-ons are only told apart by their size.
function getProductVariantShortTitle( title: string ): string {
	const match = title.match( /(\d+(?:GB|TB))/ );
	return match ? match[ 1 ] : title;
}

export function getProductShortTitle( product: AgencyProduct, removeVariant = false ): string {
	const title = getProductTitle( product.name, removeVariant );
	if ( product.family_slug === BACKUP_STORAGE_FAMILY_SLUG ) {
		return getProductVariantShortTitle( title );
	}
	return title.replaceAll( /(?:Woocommerce\s|Pressable\s|[)(])/gi, '' );
}
