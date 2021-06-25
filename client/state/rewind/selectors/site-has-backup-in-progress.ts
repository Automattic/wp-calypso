/**
 * Internal dependencies
 */
import { AppState } from 'calypso/types';
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';

const siteHasBackupInProgress = ( state: AppState, siteId: number ): boolean => {
	const recentBackups = getRewindBackups( state, siteId );
	return recentBackups?.some?.( ( b ) => b.status === 'started' ) || false;
};

export default siteHasBackupInProgress;
