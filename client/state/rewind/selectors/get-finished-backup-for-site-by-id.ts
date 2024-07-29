import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import { AppState } from 'calypso/types';

const getFinishedBackupForSiteById = ( state: AppState, siteId: number, id: number ) => {
	const backups = getRewindBackups( state, siteId );
	return backups?.find?.( ( b ) => b.id === id && 'finished' === b.status );
};

export default getFinishedBackupForSiteById;
