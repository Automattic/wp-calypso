import type { ShoppingCartItem } from '../types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

const PRESSABLE_PHP_MEMORY_ADDON_PREFIX = 'pressable-addon-php-memory-';

export function isPressablePhpMemoryAddon( product: Pick< APIProductFamilyProduct, 'slug' > ) {
	return product.slug.startsWith( PRESSABLE_PHP_MEMORY_ADDON_PREFIX );
}

export function getPressableMemoryTarget(
	product: Pick< APIProductFamilyProduct, 'site_domain' >
) {
	return product.site_domain?.trim() ?? '';
}

export function getProductCardKey(
	product: Pick< APIProductFamilyProduct, 'slug' | 'site_domain' >
) {
	if ( ! isPressablePhpMemoryAddon( product ) ) {
		return product.slug;
	}

	return `${ product.slug }:${ encodeURIComponent( getPressableMemoryTarget( product ) ) }`;
}

export function isSameMarketplaceProduct(
	item: ShoppingCartItem,
	product: APIProductFamilyProduct,
	quantity: number
) {
	if ( item.slug !== product.slug || item.quantity !== quantity ) {
		return false;
	}

	if ( ! isPressablePhpMemoryAddon( product ) && ! isPressablePhpMemoryAddon( item ) ) {
		return true;
	}

	return getPressableMemoryTarget( item ) === getPressableMemoryTarget( product );
}
