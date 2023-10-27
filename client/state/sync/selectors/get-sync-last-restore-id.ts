import { get, flowRight as compose } from 'lodash';
import { getSiteSync } from 'calypso/state/sync/selectors/get-site-sync';
import type { AppState } from 'calypso/types';

import 'calypso/state/sync/init';

/**
 * Helper to get site that is syncing from local sync state sub-tree
 * @param {Object} state sync ub-tree for a site
 * @returns {string} string site that is syncing
 */
export const getSyncSiteLastRestoreIdData = ( state: AppState ): string =>
	get( state, 'lastRestoreId', '' );

/**
 * Returns status info for sync progress
 * @param {Object} state global app state
 * @param {number} siteId requested site for site sync info
 * @returns {string} string  type of the syncing site
 */
export const getSyncLastRestoreId = compose( getSyncSiteLastRestoreIdData, getSiteSync );
