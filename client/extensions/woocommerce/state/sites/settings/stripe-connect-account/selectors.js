/** @format */

/**
 * External dependencies
 */

import { get, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

const getRawSettings = ( state, siteId ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'settings', 'stripeConnectAccount' ],
		{}
	);
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether we are presently attempting to create an account
 */
export function getError( state, siteId = getSelectedSiteId( state ) ) {
	return get( getRawSettings( state, siteId ), [ 'error' ], '' );
}

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether we are presently attempting to create an account
 */
export function getIsCreating( state, siteId = getSelectedSiteId( state ) ) {
	return get( getRawSettings( state, siteId ), [ 'isCreating' ], false );
}

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether we are presently attempting to deauthorize the connected account for the site
 */
export function getIsDeauthorizing( state, siteId = getSelectedSiteId( state ) ) {
	return get( getRawSettings( state, siteId ), [ 'isDeauthorizing' ], false );
}

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether we are presently attempting to complete the OAuth connection
 */
export function getIsOAuthConnecting( state, siteId = getSelectedSiteId( state ) ) {
	return get( getRawSettings( state, siteId ), [ 'isOAuthConnecting' ], false );
}

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether we are presently requesting oauth initialization
 */
export function getIsOAuthInitializing( state, siteId = getSelectedSiteId( state ) ) {
	return get( getRawSettings( state, siteId ), [ 'isOAuthInitializing' ], false );
}

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {String} URL to which to navigate to kick off the OAuth flow at Stripe
 */
export function getOAuthURL( state, siteId = getSelectedSiteId( state ) ) {
	return get( getRawSettings( state, siteId ), [ 'oauthUrl' ], '' );
}

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether we are presently requesting connect account details from the server
 */
export function getIsRequesting( state, siteId = getSelectedSiteId( state ) ) {
	return get( getRawSettings( state, siteId ), [ 'isRequesting' ], false );
}

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The details of the connect account for the site, if any
 */
export function getStripeConnectAccount( state, siteId = getSelectedSiteId( state ) ) {
	const rawSettings = getRawSettings( state, siteId );
	return omit( rawSettings, [
		'error',
		'isCreating',
		'isDeauthorizing',
		'isOAuthConnecting',
		'isOAuthInitializing',
		'isRequesting',
		'oauthUrl',
	] );
}
