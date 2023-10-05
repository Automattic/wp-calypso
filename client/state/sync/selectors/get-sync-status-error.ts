import { get, flowRight as compose } from 'lodash';
import { getSiteSync } from 'calypso/state/sync/selectors/get-site-sync';
import type { AppState } from 'calypso/types';

import 'calypso/state/sync/init';

/**
 * Helper to get status state from local sync state sub-tree
 * @param {Object} state automated transfer state sub-tree for a site
 * @returns {string | null } error of status
 */
export const getStatusErrorData = ( state: AppState ): string | null => get( state, 'error', null );

/**
 * Returns status info for sync state
 * @param {Object} state global app state
 * @param {number} siteId requested site for site sync info
 * @returns {string|null} status if available else `null`
 */
export const getSyncStatusError = compose( getStatusErrorData, getSiteSync );
