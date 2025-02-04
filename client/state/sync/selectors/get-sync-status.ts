import { get, flowRight as compose } from 'lodash';
import { getSiteSync } from 'calypso/state/sync/selectors/get-site-sync';
import type { AppState } from 'calypso/types';

import 'calypso/state/sync/init';

/**
 * Helper to get status state from local sync state sub-tree
 * @param {Object} state sync status state sub-tree for a site
 * @returns {string} status of transfer
 */
export const getStatusData = ( state: AppState ): string | null => get( state, 'status', null );

/**
 * Returns status info for sync state
 * @param {Object} state global app state
 * @param {number} siteId requested site for site sync info
 * @returns {string|null} status if available else `null`
 */
export const getSyncStatus = compose( getStatusData, getSiteSync );
