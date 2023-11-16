import { areJetpackCredentialsInvalid } from 'calypso/state/jetpack/credentials/selectors';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import getIsRestoreInProgress from 'calypso/state/selectors/get-is-restore-in-progress';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { AppState } from 'calypso/types';

const canRestoreSite = ( state: AppState, siteId: number ): boolean => {
	const doesRewindNeedCredentials = getDoesRewindNeedCredentials( state, siteId ) as boolean;
	const isRestoreInProgress = getIsRestoreInProgress( state, siteId );
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	const areCredentialsInvalid = areJetpackCredentialsInvalid( state, siteId, 'main' );

	return ! (
		doesRewindNeedCredentials ||
		isRestoreInProgress ||
		( ! isAtomic && areCredentialsInvalid )
	);
};

export default canRestoreSite;
