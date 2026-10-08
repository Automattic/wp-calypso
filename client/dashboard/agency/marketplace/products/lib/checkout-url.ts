import { a4aLink } from '../../../../utils/link';
import { WPCOM_CREATOR_PLAN_SLUG } from '../../lib/wpcom-hosting';
import {
	AGENCY_CHECKOUT_PATH,
	MARKETPLACE_PURCHASES_ROUTE,
	getAgencySiteCheckoutPath,
} from '../../paths';
import type { MarketplaceType } from '../../use-marketplace-type';
import type { TermPricing } from '../../use-term-pricing';
import type { AgencyProduct } from '@automattic/api-core';

/**
 * The checkout pending page swaps this for the receipt id, but only after a
 * successful payment, so `receipt_id` on the return URL means the cart was bought.
 */
export const RECEIPT_ID_PLACEHOLDER = ':receiptId';
export const RECEIPT_ID_PARAM = 'receipt_id';
/** Names the cart the checkout was for, so the return empties that one. */
export const CHECKOUT_CART_PARAM = 'cart';

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
	cart = 'regular',
}: {
	hasWpcomHostingPlan: boolean;
	cart?: MarketplaceType;
} ): string {
	const filter = hasWpcomHostingPlan ? 'status=unassigned&search=WordPress.com&' : '';
	const cartParam = cart === 'referral' ? `${ CHECKOUT_CART_PARAM }=referral&` : '';
	return `${ window.location.origin }${ MARKETPLACE_PURCHASES_ROUTE }?${ filter }${ cartParam }${ RECEIPT_ID_PARAM }=${ RECEIPT_ID_PLACEHOLDER }`;
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
 * dashboard, on the referral checkout route, except a cart of free products,
 * which the agency takes for itself through this checkout.
 */
export function getCheckoutUrl(
	lines: CheckoutLine[],
	{
		term,
		hasWpcomHostingPlan = false,
		cart = 'regular',
	}: { term: TermPricing; hasWpcomHostingPlan?: boolean; cart?: MarketplaceType }
): string {
	const search = new URLSearchParams( {
		products: lines
			.map( ( { product, quantity } ) => `${ product.slug }:${ quantity }` )
			.join( ',' ),
		term,
		redirect_to: getCheckoutReturnUrl( { hasWpcomHostingPlan, cart } ),
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

// TODO: The dashboard assumes every agency is on Billing Dragon. Until the
// last agencies move off the previous billing system, their carts go to the
// checkout that can charge them, with the products pre-selected.
export function getLegacyCheckoutUrl( lines: CheckoutLine[] ): string {
	return a4aLink(
		`/marketplace/checkout?product_slug=${ lines.map( ( { product } ) => product.slug ).join( ',' ) }`
	);
}
