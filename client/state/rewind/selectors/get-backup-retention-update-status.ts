import { BACKUP_RETENTION_UPDATE_REQUEST } from '../retention/constants';
import type { AppState } from 'calypso/types';
import 'calypso/state/rewind/init';

/**
 * Returns the update backup retention request's status.
 *
 * @param state The application state.
 * @param siteId The site ID for which to retrieve days of backups saved.
 * @returns The the status of the request.
 */
const getBackupRetentionUpdateRequestStatus = ( state: AppState, siteId: number ): string =>
	state.rewind[ siteId ]?.retention.updateRequestStatus ??
	BACKUP_RETENTION_UPDATE_REQUEST.UNSUBMITTED;

export default getBackupRetentionUpdateRequestStatus;
