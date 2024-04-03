import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import { AppState } from 'calypso/types';

const siteHasBackups = ( state: AppState, siteId: number ): boolean => {
	const backups = getRewindBackups( state, siteId ) || [];
	// in-progress backups should not be counted as backups, yet.
	return backups.filter( ( backup ) => backup.status !== 'started' ).length > 0;
};

export default siteHasBackups;
