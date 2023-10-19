import { get, flowRight as compose } from 'lodash';
import { getSiteSync } from 'calypso/state/sync/selectors/get-site-sync';
import type { AppState } from 'calypso/types';

import 'calypso/state/sync/init';

/**
 * Helper to get site that is syncing from local sync state sub-tree
 * @param {Object} state sync ub-tree for a site
 * @returns {('production' | 'staging' | null)} string site that is syncing
 */
export const getSyncSourceSiteData = ( state: AppState ): 'staging' | 'production' | null =>
	get( state, 'syncingSourceSite', '' );

/**
 * Returns status info for sync progress
 * @param {Object} state global app state
 * @param {number} siteId requested site for site sync info
 * @returns {('production' | 'staging' | null)} string syncingSiteTarget type of the syncing site
 */
export const getSyncSourceSite = compose( getSyncSourceSiteData, getSiteSync );
