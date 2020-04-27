/**
 * Internal dependencies
 */
import { BACKUPS_REQUEST_SUCCESS } from 'state/action-types';

export const getBackups = ( siteId, backups ) => {
	return {
		type: BACKUPS_REQUEST_SUCCESS,
		siteId,
		backups,
	};
};
