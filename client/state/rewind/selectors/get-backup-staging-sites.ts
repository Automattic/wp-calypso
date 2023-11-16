import { APIRewindStagingSiteInfo } from 'calypso/state/rewind/staging/types';
import type { AppState } from 'calypso/types';

/**
 * Returns the list of staging sites related to given site ID.
 * @param state The application state.
 * @param siteId The site for which to retrieve the staging sites.
 * @returns true if staging sites are being requested; otherwise, false.
 */
const getBackupStagingSites = ( state: AppState, siteId: number ): APIRewindStagingSiteInfo[] =>
	state.rewind[ siteId ]?.staging?.stagingSitesList?.sites || [];

export default getBackupStagingSites;
