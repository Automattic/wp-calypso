import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import getIsRestoreInProgress from 'calypso/state/selectors/get-is-restore-in-progress';
import isJetpackSiteConnected from 'calypso/state/selectors/is-jetpack-site-connected';
import { AppState } from 'calypso/types';

const canRestoreSite = ( state: AppState, siteId: number ): boolean => {
	const doesRewindNeedCredentials = getDoesRewindNeedCredentials( state, siteId ) as boolean;
	const isRestoreInProgress = getIsRestoreInProgress( state, siteId );
	const isSiteConnected = isJetpackSiteConnected( state, siteId );

	if ( ! isSiteConnected ) {
		return false;
	}

	return ! ( doesRewindNeedCredentials || isRestoreInProgress );
};

export default canRestoreSite;
