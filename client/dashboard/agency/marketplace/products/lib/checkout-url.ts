import { WPCOM_CREATOR_PLAN_SLUG } from '../../lib/wpcom-hosting';
import {
	AGENCY_CHECKOUT_PATH,
	MARKETPLACE_PURCHASES_ROUTE,
	getAgencySiteCheckoutPath,
} from '../../paths';
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

// Back on the checkout returns here, with the cart still in place.
function getCurrentPageUrl(): string {
	return `${ window.location.origin }${ window.location.pathname }${ window.location.search }`;
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
		cancel_to: getCurrentPageUrl(),
	} );
	return `${ window.location.origin }${ AGENCY_CHECKOUT_PATH }?${ search }`;
}

/**
 * The checkout that launches one of the agency's development sites: the
 * WordPress.com plan for that one site, paid on the site's own cart. Lands on
 * the site once it is paid for.
 */
export function getSiteLaunchCheckoutUrl( siteSlug: string ): string {
	const search = new URLSearchParams( {
		redirect_to: `${ window.location.origin }/sites/${ siteSlug }`,
		cancel_to: getCurrentPageUrl(),
	} );
	const path = getAgencySiteCheckoutPath( siteSlug, WPCOM_CREATOR_PLAN_SLUG );
	return `${ window.location.origin }${ path }?${ search }`;
}
