/**
 * External dependencies
 */
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { addQueryArgs } from 'calypso/lib/route';
import { QueryArgs } from 'calypso/my-sites/plans/jetpack-plans/types';

/**
 * build the URL to checkout page for the enviroment and products.
 *
 * @param {string} siteSlug Selected site
 * @param {string | string[]} products Slugs of the products to add to the cart
 * @param {QueryArgs} urlQueryArgs Additional query params appended to url (ie. for affiliate tracking, or whatever)
 */
export default function buildCheckoutURL(
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

	// host maybe needed in either `jetpack/siteless-checkout` or `jetpack/userless-checkout` below
	const host =
		'development' === urlQueryArgs.calypso_env
			? 'http://calypso.localhost:3000'
			: 'https://wordpress.com';

	if ( ! siteSlug && config.isEnabled( 'jetpack/siteless-checkout' ) ) {
		return addQueryArgs( urlQueryArgs, host + `/checkout/jetpack/${ productsString }` );
	}

	if ( config.isEnabled( 'jetpack/userless-checkout' ) ) {
		const { unlinked, purchasetoken, purchaseNonce, site } = urlQueryArgs;
		const canDoUnlinkedCheckout = unlinked && !! site && ( !! purchasetoken || purchaseNonce );

		// Enter userless checkout if unlinked, purchasetoken or purchaseNonce, and site are all set
		if ( isJetpackCloud() && canDoUnlinkedCheckout ) {
			return addQueryArgs(
				urlQueryArgs,
				host + `/checkout/jetpack/${ siteSlug }/${ productsString }`
			);
		}
	}

	// If there is not siteSlug, we need to redirect the user to the site selection
	// step of the flow. Since purchases of multiple products are allowed, we need
	// to pass all products separated by comma in the URL.
	const path = siteSlug
		? `/checkout/${ siteSlug }/${ productsString }`
		: `/jetpack/connect/${ productsString }`;

	return isJetpackCloud() && ! config.isEnabled( 'jetpack-cloud/connect' )
		? addQueryArgs( urlQueryArgs, `https://wordpress.com${ path }` )
		: addQueryArgs( urlQueryArgs, path );
}
