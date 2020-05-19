/**
 * Internal dependencies
 */
import { getAuthorizationData } from 'state/jetpack-connect/selectors/get-authorization-data';
import { getJetpackSiteByUrl } from 'state/jetpack-connect/selectors/get-jetpack-site-by-url';

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
