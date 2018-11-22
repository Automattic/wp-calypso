/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns whether we are already fetching the Atomic transfer for given siteId.
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {?Boolean} whether we are fetching transfer status for given siteId
 */
export default ( state, siteId ) => {
	return get( state, [ 'atomicTransfer', siteId, 'fetchingTransfer' ], false );
};
