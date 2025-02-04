import { APIRewindStagingSiteInfo } from 'calypso/state/rewind/staging/types';
import type { AppState } from 'calypso/types';

/**
 * Returns the staging site info related to given site ID.
 * @param state The application state.
 * @param siteId The site for which to fetch the staging info.
 * @returns APIRewindStagingSiteInfo object if staging site info is available; otherwise, null.
 */
const getBackupStagingSiteInfo = ( state: AppState, siteId: number ): APIRewindStagingSiteInfo =>
	state.rewind[ siteId ]?.staging?.site?.info ?? null;

export default getBackupStagingSiteInfo;
