import { get, isEmpty } from 'lodash';
import { getSiteSync } from 'calypso/state/sync/selectors/get-site-sync';

import 'calypso/state/automated-transfer/init';

/**
 * Returns whether we are fetching sync status for given siteId
 * @param {Object} state global state
 * @param {?number} siteId requested site for sync status info
 * @returns {?boolean} Whether we are fetching sync status for given siteId
 */
export default ( state, siteId ) => {
	if ( ! siteId ) {
		return null;
	}

	const siteSync = getSiteSync( state, siteId );

	if ( ! siteSync || isEmpty( siteSync ) ) {
		return null;
	}

	return get( siteSync, 'fetchingStatus', false );
};
