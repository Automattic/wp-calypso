import { createRequestCartProduct } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { getBillingProductId } from '../agency-checkout/lib/billing-product-id';
import { useFilledAgencyCart } from '../agency-checkout/use-filled-agency-cart';
import type { AgencyCheckoutTerm } from '../agency-checkout/lib/billing-product-id';
import type { BuildAgencyCartLines } from '../agency-checkout/use-filled-agency-cart';

/**
 * Fills a development site's own cart with the plan that launches it. The
 * line is marked as a development site checkout, which is what turns the site
 * into a paid one once the order goes through.
 */
export default function useSitePlanCart(
	siteId: number,
	productSlug: string,
	term: AgencyCheckoutTerm
) {
	const translate = useTranslate();
	const buildLines = useCallback< BuildAgencyCartLines >(
		( agencyId, products ) => {
			const product = products.find( ( candidate ) => candidate.slug === productSlug );
			if ( ! product ) {
				return [];
			}
			return [
				createRequestCartProduct( {
					product_id: getBillingProductId( product, term ),
					product_slug: product.slug,
					extra: { agency_id: agencyId, isA4ADevSiteCheckout: true },
				} ),
			];
		},
		[ productSlug, term ]
	);

	return useFilledAgencyCart(
		siteId,
		buildLines,
		translate( 'This plan is not available to your agency.' )
	);
}
