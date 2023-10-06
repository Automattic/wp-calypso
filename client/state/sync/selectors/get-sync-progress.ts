import { get, flowRight as compose } from 'lodash';
import { getSiteSync } from 'calypso/state/sync/selectors/get-site-sync';
import type { AppState } from 'calypso/types';

import 'calypso/state/sync/init';

/**
 * Helper to get progress state from local sync state sub-tree
 * @param {Object} state sync status state sub-tree for a site
 * @returns {number} progress of transfer
 */
export const getProgressData = ( state: AppState ): number => get( state, 'progress', 0 );

/**
 * Returns status info for sync progress
 * @param {Object} state global app state
 * @param {number} siteId requested site for site sync info
 * @returns {number} progress of transfer
 */
export const getSyncProgress = compose( getProgressData, getSiteSync );
