import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import { AppState } from 'calypso/types';

const getInProgressBackupForSite = ( state: AppState, siteId: number ) => {
	const backups = getRewindBackups( state, siteId );
	return backups?.find?.( ( b ) => b.status === 'started' );
};

export default getInProgressBackupForSite;
