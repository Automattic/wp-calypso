import { wpcomLink } from '../../../../utils/link';
import { MARKETPLACE_PURCHASES_ROUTE, WPCOM_AGENCY_CHECKOUT_PATH } from '../../paths';
import type { TermPricing } from '../../use-term-pricing';
import type { AgencyProduct } from '@automattic/api-core';

/**
 * The checkout pending page swaps this for the receipt id, but only after a
 * successful payment, so `receipt_id` on the return URL means the cart was bought.
 */
export const RECEIPT_ID_PLACEHOLDER = ':receiptId';
export const RECEIPT_ID_PARAM = 'receipt_id';

export interface CheckoutLine {
	product: AgencyProduct;
	quantity: number;
}

/**
 * Where WordPress.com sends the agency after paying: Purchases, filtered to the
 * WordPress.com licenses waiting for a site when the cart held a WordPress.com
 * plan, the way classic lands on its needs-setup list. Built by hand because
 * `URLSearchParams` would percent-encode the colon the pending page looks for.
 */
export function getCheckoutReturnUrl( {
	hasWpcomHostingPlan,
}: {
	hasWpcomHostingPlan: boolean;
} ): string {
	const filter = hasWpcomHostingPlan ? 'status=unassigned&search=WordPress.com&' : '';
	return `${ window.location.origin }${ MARKETPLACE_PURCHASES_ROUTE }?${ filter }${ RECEIPT_ID_PARAM }=${ RECEIPT_ID_PLACEHOLDER }`;
}

/**
 * The product WordPress.com bills for a line: the variant of the chosen term,
 * and for WordPress.com and Jetpack products the agency-specific id the store
 * accepts on a siteless cart. Same rule as classic's cart. The id travels in
 * the link because the checkout runs under the WordPress.com session, which
 * the agency product endpoint does not answer.
 */
/** The product of the chosen term, which is what a referral is made of. */
export function getTermProductId( product: AgencyProduct, term: TermPricing ): number {
	return (
		( term === 'yearly' ? product.yearly_product_id : product.monthly_product_id ) ||
		product.product_id
	);
}

export function getBillingProductId( product: AgencyProduct, term: TermPricing ): number {
	const termProductId = getTermProductId( product, term );
	const termAlternativeProductId =
		( term === 'yearly'
			? product.yearly_alternative_product_id
			: product.monthly_alternative_product_id ) || product.alternative_product_id;
	return termAlternativeProductId || termProductId;
}

/**
 * The WordPress.com checkout link for a regular cart. Referral carts stay in
 * the dashboard, on the referral checkout route.
 */
export function getCheckoutUrl(
	lines: CheckoutLine[],
	{
		agencyId,
		term,
		hasWpcomHostingPlan = false,
	}: { agencyId: number; term: TermPricing; hasWpcomHostingPlan?: boolean }
): string {
	const search = new URLSearchParams( {
		agency_id: String( agencyId ),
		products: lines
			.map(
				( { product, quantity } ) =>
					`${ product.slug }:${ quantity }:${ getBillingProductId( product, term ) }`
			)
			.join( ',' ),
		redirect_to: getCheckoutReturnUrl( { hasWpcomHostingPlan } ),
		// Back on the checkout returns here, with the cart still in place.
		cancel_to: `${ window.location.origin }${ window.location.pathname }${ window.location.search }`,
	} );
	return wpcomLink( `${ WPCOM_AGENCY_CHECKOUT_PATH }?${ search }` );
}
