import { get } from 'lodash';
import { getAuthorizationData } from 'calypso/state/jetpack-connect/selectors/get-authorization-data';

import 'calypso/state/jetpack-connect/init';

/**
 * Returns the remote site data collected during the user-connection check,
 * or null if not yet available.
 *
 * Present when the site was accessible but the current user is not connected.
 * Contains { jetpack, jetpackConnection, siteOwner }.
 * @param  {Object}  state Global state tree
 * @returns {Object|null}  Remote site data or null
 */
export const getRemoteSiteData = ( state ) => {
	return get( getAuthorizationData( state ), 'remoteSiteData', null );
};
