import { AGENCY_CHECKOUT_PATH, MARKETPLACE_PURCHASES_ROUTE } from '../../paths';
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
 * Where the checkout sends the agency after paying: Purchases, filtered to the
 * WordPress.com licenses waiting for a site when the cart held a WordPress.com
 * plan. Built by hand because `URLSearchParams` would percent-encode the colon
 * the pending page looks for.
 */
export function getCheckoutReturnUrl( {
	hasWpcomHostingPlan,
}: {
	hasWpcomHostingPlan: boolean;
} ): string {
	const filter = hasWpcomHostingPlan ? 'status=unassigned&search=WordPress.com&' : '';
	return `${ window.location.origin }${ MARKETPLACE_PURCHASES_ROUTE }?${ filter }${ RECEIPT_ID_PARAM }=${ RECEIPT_ID_PLACEHOLDER }`;
}

/** The product of the chosen term, which is what a referral is made of. */
export function getTermProductId( product: AgencyProduct, term: TermPricing ): number {
	return (
		( term === 'yearly' ? product.yearly_product_id : product.monthly_product_id ) ||
		product.product_id
	);
}

/**
 * The checkout link for a regular cart: the products, their quantities and the
 * billing term. The checkout works out the agency and the billing products
 * from the account of the user who is logged in. Referral carts stay in the
 * dashboard, on the referral checkout route.
 */
export function getCheckoutUrl(
	lines: CheckoutLine[],
	{ term, hasWpcomHostingPlan = false }: { term: TermPricing; hasWpcomHostingPlan?: boolean }
): string {
	const search = new URLSearchParams( {
		products: lines
			.map( ( { product, quantity } ) => `${ product.slug }:${ quantity }` )
			.join( ',' ),
		term,
		redirect_to: getCheckoutReturnUrl( { hasWpcomHostingPlan } ),
		// Back on the checkout returns here, with the cart still in place.
		cancel_to: `${ window.location.origin }${ window.location.pathname }${ window.location.search }`,
	} );
	return `${ window.location.origin }${ AGENCY_CHECKOUT_PATH }?${ search }`;
}
