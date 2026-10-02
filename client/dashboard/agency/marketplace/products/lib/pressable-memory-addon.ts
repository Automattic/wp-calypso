import type { AgencyProduct } from '@automattic/api-core';

const PRESSABLE_PHP_MEMORY_ADDON_PREFIX = 'pressable-addon-php-memory-';

export function isPressablePhpMemoryAddon( product: Pick< AgencyProduct, 'slug' > ): boolean {
	return product.slug.startsWith( PRESSABLE_PHP_MEMORY_ADDON_PREFIX );
}

/** The Pressable site a PHP memory add-on applies to, or undefined for any other product. */
export function getPressableMemoryTarget(
	product: Pick< AgencyProduct, 'slug' | 'site_domain' >
): string | undefined {
	if ( ! isPressablePhpMemoryAddon( product ) ) {
		return undefined;
	}
	return product.site_domain?.trim() || undefined;
}

/** A cart entry's encoded site, or undefined when it is malformed (it may come from a URL). */
export function decodeSiteDomain( value: string | undefined ): string | undefined {
	if ( ! value ) {
		return undefined;
	}
	try {
		return decodeURIComponent( value );
	} catch {
		return undefined;
	}
}

/**
 * Whether `product` is the one a cart entry names. The products API returns a
 * PHP memory add-on once per Pressable site under the same slug, so those also
 * have to match on the site.
 */
export function matchesCartEntry(
	product: Pick< AgencyProduct, 'slug' | 'site_domain' >,
	entry: { slug: string; siteDomain?: string }
): boolean {
	return (
		product.slug === entry.slug &&
		( ! isPressablePhpMemoryAddon( product ) ||
			( getPressableMemoryTarget( product ) ?? '' ) === ( entry.siteDomain ?? '' ) )
	);
}
