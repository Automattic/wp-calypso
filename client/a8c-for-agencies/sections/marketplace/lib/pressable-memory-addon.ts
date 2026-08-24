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
