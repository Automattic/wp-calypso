import {
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
} from '@automattic/calypso-products';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { addQueryArgs } from 'calypso/lib/route';
import { managePurchase } from 'calypso/me/purchases/paths';
import {
	EXTERNAL_PRODUCTS_LIST,
	INDIRECT_CHECKOUT_PRODUCTS_LIST,
	PURCHASE_FLOW_UPSELLS_MATRIX,
} from 'calypso/my-sites/plans/jetpack-plans/constants';
import { getYearlySlugFromMonthly } from 'calypso/my-sites/plans/jetpack-plans/convert-slug-terms';
import type { Purchase } from 'calypso/lib/purchases/types';
import type {
	PurchaseURLCallback,
	QueryArgs,
	SelectorProduct,
} from 'calypso/my-sites/plans/jetpack-plans/types';

/**
 * build the URL to checkout page for the enviroment and products.
 *
 * @param {string} siteSlug Selected site
 * @param {string | string[]} products Slugs of the products to add to the cart
 * @param {QueryArgs} urlQueryArgs Additional query params appended to url (ie. for affiliate tracking, or whatever)
 */
export function buildCheckoutURL(
	siteSlug: string,
	products: string | string[],
	urlQueryArgs: QueryArgs = {}
): string {
	const productsArray = Array.isArray( products ) ? products : [ products ];
	const productsString = productsArray.join( ',' );

	if ( isJetpackCloud() ) {
		// Unauthenticated users will be presented with a Jetpack branded version of the login form
		// if the URL has the query parameter `source=jetpack-plans`. We only want to do this if the
		// user is in Jetpack Cloud.
		if ( ! urlQueryArgs.source ) {
			urlQueryArgs.source = 'jetpack-plans';
		}

		// This URL is used when clicking the back button in the checkout screen to redirect users
		// back to cloud instead of wordpress.com
		if ( ! urlQueryArgs.checkoutBackUrl ) {
			urlQueryArgs.checkoutBackUrl = window.location.href;
		}
	}
	// host maybe needed in either siteless or userless checkout below
	const host =
		'development' === urlQueryArgs.calypso_env
			? 'http://calypso.localhost:3000'
			: 'https://wordpress.com';

	// siteless checkout
	if (
		! siteSlug &&
		! [ PRODUCT_JETPACK_SEARCH, PRODUCT_JETPACK_SEARCH_MONTHLY ].includes( productsString )
	) {
		return addQueryArgs( urlQueryArgs, host + `/checkout/jetpack/${ productsString }` );
	}

	// Enter userless checkout if unlinked, purchasetoken or purchaseNonce, and site are all set
	const { unlinked, purchasetoken, purchaseNonce, site } = urlQueryArgs;
	const canDoUnlinkedCheckout = unlinked && !! site && ( !! purchasetoken || purchaseNonce );

	if ( isJetpackCloud() && canDoUnlinkedCheckout ) {
		return addQueryArgs(
			urlQueryArgs,
			host + `/checkout/jetpack/${ siteSlug }/${ productsString }`
		);
	}

	// If there is not siteSlug, we need to redirect the user to the site selection
	// step of the flow. Since purchases of multiple products are allowed, we need
	// to pass all products separated by comma in the URL.
	const path = siteSlug
		? `/checkout/${ siteSlug }/${ productsString }`
		: `/jetpack/connect/${ productsString }`;

	return isJetpackCloud()
		? addQueryArgs( urlQueryArgs, `https://wordpress.com${ path }` )
		: addQueryArgs( urlQueryArgs, path );
}

/**
 * Build the URL to the upsell page.
 *
 * @param {string} siteSlug Selected site
 * @param {string | string[]} products Slugs of the products to add to the cart
 * @param {QueryArgs} urlQueryArgs Additional query params appended to url (ie. for affiliate tracking, or whatever)
 * @param {string} rootUrl Plans/pricing page root URL
 * @returns {string|null}
 */
export const buildUpsellURL = (
	siteSlug: string,
	products: string | string[],
	urlQueryArgs: QueryArgs = {},
	rootUrl = ''
): string | null => {
	const productsArray = Array.isArray( products ) ? products : [ products ];
	// Upsell page only supports one product
	const product = productsArray[ 0 ];

	// If upsell exists
	if ( product in PURCHASE_FLOW_UPSELLS_MATRIX ) {
		if ( isJetpackCloud() && ! urlQueryArgs.checkoutBackUrl ) {
			urlQueryArgs.checkoutBackUrl = window.location.href;
		} else if ( ! urlQueryArgs.cancel_to ) {
			urlQueryArgs.cancel_to = `${ rootUrl.replace( /\/$/, '' ) }/${ siteSlug || '' }`;
		}

		return addQueryArgs(
			urlQueryArgs,
			`${ rootUrl.replace( /\/$/, '' ) }/upsell/${ product }/${ siteSlug }`
		);
	}

	return null;
};

/**
 * Get the function for generating the URL for the product checkout page
 *
 * @param {string} siteSlug Slug of the site
 * @param {QueryArgs} urlQueryArgs Additional query params appended to url
 * @param {string} locale Selected locale
 * @param {string} rootUrl Plans/pricing page root URL
 * @param {boolean} showUpsellPage Whether to show the upsell page before checkout
 */
export const getPurchaseURLCallback =
	(
		siteSlug: string,
		urlQueryArgs: QueryArgs,
		locale?: string,
		rootUrl?: string,
		showUpsellPage?: boolean
	): PurchaseURLCallback =>
	( product: SelectorProduct, isUpgradeableToYearly?, purchase?: Purchase ) => {
		if ( locale ) {
			urlQueryArgs.lang = locale;
		}
		if ( EXTERNAL_PRODUCTS_LIST.includes( product.productSlug ) ) {
			return product.externalUrl || '';
		}
		if ( purchase && isUpgradeableToYearly ) {
			const { productSlug: slug } = product;
			const yearlySlug = getYearlySlugFromMonthly( slug );
			return yearlySlug ? buildCheckoutURL( siteSlug, yearlySlug, urlQueryArgs ) : undefined;
		}
		if ( purchase ) {
			const relativePath = managePurchase( siteSlug, purchase.id );
			return isJetpackCloud() ? `https://wordpress.com${ relativePath }` : relativePath;
		}

		// Visit the indirect checkout URL to determine the purchasable product on another page.
		// TODO: Use the checkout URL and product page URL respectively to alternate the externalUrl.
		if ( INDIRECT_CHECKOUT_PRODUCTS_LIST.includes( product.productSlug ) ) {
			return product.externalUrl?.replace( '{siteSlug}', siteSlug ) || '';
		}

		let url;

		// Link to upsell page if upsell feature enabled
		if ( showUpsellPage ) {
			url = buildUpsellURL( siteSlug, product.productSlug, urlQueryArgs, rootUrl );
		}

		return url || buildCheckoutURL( siteSlug, product.productSlug, urlQueryArgs );
	};
