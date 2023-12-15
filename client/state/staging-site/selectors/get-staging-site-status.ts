import { StagingSiteStatus } from 'calypso/state/staging-site/constants';
import { getStagingSiteInfo } from 'calypso/state/staging-site/selectors/get-staging-site-info';
import type { AppState } from 'calypso/types';

import 'calypso/state/staging-site/init';

/**
 * Helper to get status state from local transfer state sub-tree
 * @param {Object} state automated transfer state sub-tree for a site
 * @returns {string|null} status of transfer
 */
export const getStagingSiteStatusData = ( state: AppState ): string | null =>
	state?.status ?? StagingSiteStatus.UNSET;

/**
 * Returns status info for transfer
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {string|null} transferStatusType if available else ''
 */
export function getStagingSiteStatus( state: AppState, siteId: number | null ): string | null {
	return getStagingSiteStatusData( getStagingSiteInfo( state, siteId ) );
}
