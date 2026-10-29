import { createRequestCartProduct } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import {
	getPressableMemoryTarget,
	matchesCartEntry,
} from 'calypso/dashboard/agency/marketplace/products/lib/pressable-memory-addon';
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
export default function useAgencyCart(
	entries: AgencyCartEntry[],
	term: AgencyCheckoutTerm,
	notApprovedExitUrl: string
) {
	const translate = useTranslate();
	const buildLines = useCallback< BuildAgencyCartLines >(
		( agencyId, products ) =>
			entries.flatMap( ( entry ) => {
				const product = products.find( ( candidate ) => matchesCartEntry( candidate, entry ) );
				if ( ! product ) {
					return [];
				}
				const siteDomain = getPressableMemoryTarget( product );
				return Array.from( { length: entry.quantity }, ( _, cartItemIndex ) =>
					createRequestCartProduct( {
						product_id: getBillingProductId( product, term ),
						product_slug: product.slug,
						extra: {
							isA4ASitelessCheckout: true,
							agency_id: agencyId,
							cart_item_index: cartItemIndex,
							// The dashboard set the term, so the checkout shows it without a picker.
							hideProductVariants: true,
							...( siteDomain ? { a4a_pressable_site_domain: siteDomain } : {} ),
						},
					} )
				);
			} ),
		[ entries, term ]
	);

	return useFilledAgencyCart(
		'no-site',
		buildLines,
		translate( 'Your cart is empty.' ),
		notApprovedExitUrl
	);
}
