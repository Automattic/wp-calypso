/**
 * Internal dependencies
 */
import { AppState } from 'calypso/types';
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';

const getInProgressBackupForSite = ( state: AppState, siteId: number ) => {
	const backups = getRewindBackups( state, siteId );
	return backups?.find?.( ( b ) => b.status === 'started' );
};

export default getInProgressBackupForSite;
