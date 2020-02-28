/**
 * Internal dependencies
 */
import { getAuthorizationData, getJetpackSiteByUrl } from 'state/jetpack-connect/selectors';

import 'state/jetpack-connect/init';

export const isRemoteSiteOnSitesList = ( state, remoteUrl ) => {
	const authorizationData = getAuthorizationData( state );

	if ( ! remoteUrl ) {
		return false;
	}

	if ( authorizationData.clientNotResponding ) {
		return false;
	}

	return !! getJetpackSiteByUrl( state, remoteUrl );
};
