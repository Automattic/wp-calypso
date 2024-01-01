import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import getIsRestoreInProgress from 'calypso/state/selectors/get-is-restore-in-progress';
import { AppState } from 'calypso/types';

const canRestoreSite = ( state: AppState, siteId: number ): boolean => {
	const doesRewindNeedCredentials = getDoesRewindNeedCredentials( state, siteId ) as boolean;
	const isRestoreInProgress = getIsRestoreInProgress( state, siteId );

	return ! ( doesRewindNeedCredentials || isRestoreInProgress );
};

export default canRestoreSite;
