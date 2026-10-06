import { createRequestCartProduct } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { getBillingProductId } from '../agency-checkout/lib/billing-product-id';
import { useFilledAgencyCart } from '../agency-checkout/use-filled-agency-cart';
import type { AgencyCartEntry } from '../agency-checkout/lib/agency-checkout-params';
import type { AgencyCheckoutTerm } from '../agency-checkout/lib/billing-product-id';
import type { BuildAgencyCartLines } from '../agency-checkout/use-filled-agency-cart';

/**
 * Fills the siteless WordPress.com cart from the dashboard's cart entries, one
 * line per unit so every WordPress.com site gets its own tier price, the way
 * the classic Billing Dragon checkout builds it. The agency and the billing
 * products come from the account of the user who is logged in, never from the
 * link.
 */
export default function useAgencyCart( entries: AgencyCartEntry[], term: AgencyCheckoutTerm ) {
	const translate = useTranslate();
	const buildLines = useCallback< BuildAgencyCartLines >(
		( agencyId, products ) =>
			entries.flatMap( ( entry ) => {
				const product = products.find( ( candidate ) => candidate.slug === entry.slug );
				if ( ! product ) {
					return [];
				}
				return Array.from( { length: entry.quantity }, ( _, cartItemIndex ) =>
					createRequestCartProduct( {
						product_id: getBillingProductId( product, term ),
						product_slug: product.slug,
						extra: {
							isA4ASitelessCheckout: true,
							agency_id: agencyId,
							cart_item_index: cartItemIndex,
						},
					} )
				);
			} ),
		[ entries, term ]
	);

	return useFilledAgencyCart( 'no-site', buildLines, translate( 'Your cart is empty.' ) );
}
