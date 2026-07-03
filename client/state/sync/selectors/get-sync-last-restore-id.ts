import { compose } from 'redux';
import { getSiteSync } from 'calypso/state/sync/selectors/get-site-sync';
import type { AppState } from 'calypso/types';

import 'calypso/state/sync/init';

/**
 * Helper to get site that is syncing from local sync state sub-tree
 * @param {Object} state sync ub-tree for a site
 * @returns {string|null} last restore ID, or null when reset
 */
export const getSyncSiteLastRestoreIdData = ( state: AppState ): string | null => {
	// Default only when the field is absent; a reducer-set `null` is preserved.
	const lastRestoreId = state?.lastRestoreId;
	return lastRestoreId === undefined ? '' : lastRestoreId;
};

/**
 * Returns status info for sync progress
 * @param {Object} state global app state
 * @param {number} siteId requested site for site sync info
 * @returns {string|null} last restore ID, or null when reset
 */
export const getSyncLastRestoreId = compose( getSyncSiteLastRestoreIdData, getSiteSync );
