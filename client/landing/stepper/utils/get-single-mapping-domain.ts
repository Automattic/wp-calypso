import { DomainProductSlugs } from '@automattic/api-core';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

/**
 * The name of the domain being connected, when the domain items hold exactly that and nothing
 * else. A connected domain still has to be pointed at the site once it is paid for, so flows that
 * sell one finish on its setup instructions.
 */
export function getSingleMappingDomain( domainCartItems: MinimalRequestCartProduct[] ) {
	if ( domainCartItems.length !== 1 ) {
		return null;
	}

	const [ domainCartItem ] = domainCartItems;

	if ( domainCartItem.product_slug !== DomainProductSlugs.DOMAIN_MAPPING ) {
		return null;
	}

	return domainCartItem.meta ?? null;
}
