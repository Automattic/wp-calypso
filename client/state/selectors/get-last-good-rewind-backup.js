/**
 * Internal dependencies
 */
import getRewindBackups from 'state/selectors/get-rewind-backups';

/**
 * Get the last full site backup.
 *
 * @param {object} state Global state tree
 * @param {number|string} siteId the site ID
 * @returns {Array} Rewind backups list
 */
export default function getLastGoodRewindBackup( state, siteId ) {
	const backups = getRewindBackups( state, siteId );
	return Array.isArray( backups )
		? backups.find( ( backup ) => backup.status === 'finished' )
		: null;
}
