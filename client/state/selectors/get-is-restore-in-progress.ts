import getRestoreProgress from './get-restore-progress';
import getRewindState from './get-rewind-state';
import type { AppState } from 'calypso/types';

/**
 * Returns true if a restore is in progres, false otherwise
 *
 */
export default function getIsRestoreInProgress( state: AppState, siteId: number ): boolean {
	const rewindState = getRewindState( state, siteId );
	const restoreProgress = getRestoreProgress( state, siteId );

	const isRewindActive = rewindState.state === 'active';

	return isRewindActive && [ 'queued', 'running' ].includes( String( restoreProgress?.status ) );
}
