import { StagingSiteStatus } from 'calypso/state/staging-site/constants';
import { getStagingSiteInfo } from 'calypso/state/staging-site/selectors/get-staging-site-info';
import type { AppState } from 'calypso/types';

import 'calypso/state/staging-site/init';

/**
 * Helper to get status state from local transfer state sub-tree
 * @param {Object} state automated transfer state sub-tree for a site
 * @returns {boolean} status of transfer
 */
export const getStagingSiteIsComplete = ( state: AppState ): boolean => {
	const status = state?.status ?? StagingSiteStatus.UNSET;
	return (
		status === StagingSiteStatus.COMPLETE ||
		status === StagingSiteStatus.REVERTED ||
		status === StagingSiteStatus.NONE ||
		status === StagingSiteStatus.UNSET
	);
};

/**
 * Returns status info for transfer
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {boolean} transferStatusType if available else ''
 */
export function getIsStagingSiteStatusComplete( state: AppState, siteId: number | null ): boolean {
	return getStagingSiteIsComplete( getStagingSiteInfo( state, siteId ) );
}
