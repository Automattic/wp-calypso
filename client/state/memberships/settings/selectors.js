import { get } from 'lodash';

import 'calypso/state/memberships/init';

export function getConnectedAccountIdForSiteId( state, siteId ) {
	return get( state, [ 'memberships', 'settings', siteId, 'connectedAccountId' ], null );
}

export function getConnectedAccountDescriptionForSiteId( state, siteId ) {
	return get( state, [ 'memberships', 'settings', siteId, 'connectedAccountDescription' ], null );
}

export function getConnectUrlForSiteId( state, siteId ) {
	return get( state, [ 'memberships', 'settings', siteId, 'connectUrl' ], '' );
}
