import { get } from 'lodash';

import 'calypso/state/memberships/init';

export function getIsConnectedForSiteId( state, siteId ) {
	return get( state, [ 'memberships', 'settings', siteId, 'isConnected' ], false );
}

export function getConnectedAccountDescriptionForSiteId( state, siteId ) {
	return get( state, [ 'memberships', 'settings', siteId, 'connectedAccountDescription' ], null );
}

export function getconnectedAccountDefaultCurrencyForSiteId( state, siteId ) {
	return get(
		state,
		[ 'memberships', 'settings', siteId, 'connectedAccountDefaultCurrency' ],
		null
	);
}
export function getconnectedAccountMinimumCurrencyForSiteId( state, siteId ) {
	return get(
		state,
		[ 'memberships', 'settings', siteId, 'connectedAccountMinimumCurrency' ],
		null
	);
}
export function getMembershipsSandboxStatusForSiteId( state, siteId ) {
	return get( state, [ 'memberships', 'settings', siteId, 'membershipsSandboxStatus' ], null );
}
export function getConnectUrlForSiteId( state, siteId ) {
	return get( state, [ 'memberships', 'settings', siteId, 'connectUrl' ], '' );
}

export function getCouponsAndGiftsEnabledForSiteId( state, siteId ) {
	return get( state, [ 'memberships', 'settings', siteId, 'couponsAndGiftsEnabled' ], null );
}
