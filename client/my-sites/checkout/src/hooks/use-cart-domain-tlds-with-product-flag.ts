import { productsQuery } from '@automattic/api-queries';
import { getTld } from '@automattic/domain-search';
import { useQuery } from '@tanstack/react-query';
import { getDomainRegistrations, getDomainTransfers } from 'calypso/lib/cart-values/cart-items';
import type { ResponseCart } from '@automattic/shopping-cart';

type DomainProductFlag = 'is_hsts_required' | 'is_dot_gay_notice_required';

/**
 * Returns the unique TLDs (with leading dot) of the domain registrations and
 * transfers in the cart whose product has the given flag set.
 */
export function useCartDomainTldsWithProductFlag(
	cart: ResponseCart,
	flag: DomainProductFlag
): string[] {
	const domains = [ ...getDomainRegistrations( cart ), ...getDomainTransfers( cart ) ];
	const { data: products } = useQuery( {
		...productsQuery(),
		enabled: domains.length > 0,
	} );

	if ( ! products ) {
		return [];
	}

	const tlds = domains
		.filter( ( domain ) => products[ domain.product_slug ]?.[ flag ] )
		.map( ( domain ) => '.' + getTld( domain.meta ) );

	return [ ...new Set( tlds ) ];
}
