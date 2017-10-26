/**
 * External dependencies
 *
 * @format
 */

import { get, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

const getRawSettings = ( state, siteId ) => {
	return get( state, [
		'extensions',
		'woocommerce',
		'sites',
		siteId,
		'settings',
		'stripeConnectAccount',
	] );
};

export function getIsRequesting( state, siteId = getSelectedSiteId( state ) ) {
	return get( getRawSettings( state, siteId ), [ 'isRequesting' ] );
}

export function getStripeConnectAccount( state, siteId = getSelectedSiteId( state ) ) {
	const rawSettings = getRawSettings( state, siteId );
	return omit( rawSettings, [ 'isRequesting' ] );
}
