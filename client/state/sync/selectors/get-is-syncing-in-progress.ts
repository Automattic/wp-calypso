import { get, flowRight as compose } from 'lodash';
import { getSiteSync } from 'calypso/state/sync/selectors/get-site-sync';
import type { AppState } from 'calypso/types';

import 'calypso/state/sync/init';

/**
 * Helper to get status state from local sync state sub-tree
 * @param {Object} state automated transfer state sub-tree for a site
 * @returns {boolean} status of transfer
 */
export const getIsSyncingInProgressData = ( state: AppState ): boolean =>
	get( state, 'isSyncingInProgress', false );

/**
 * Returns status info for sync state
 * @param {Object} state global app state
 * @param {number} siteId requested site for site sync info
 * @returns {boolean} if syncing is in progress or not
 */
export const getIsSyncingInProgress = compose( getIsSyncingInProgressData, getSiteSync );
