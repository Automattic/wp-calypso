import { BACKUP_STAGING_UPDATE_REQUEST } from '../staging/constants';
import type { AppState } from 'calypso/types';
import 'calypso/state/rewind/init';

/**
 * Returns the update backup staging flag request's status.
 * @param state The application state.
 * @param siteId The site ID
 * @returns The the status of the request.
 */
const getBackupStagingUpdateRequestStatus = ( state: AppState, siteId: number ): string =>
	state.rewind[ siteId ]?.staging?.updateStagingFlagRequestStatus ??
	BACKUP_STAGING_UPDATE_REQUEST.UNSUBMITTED;

export default getBackupStagingUpdateRequestStatus;
