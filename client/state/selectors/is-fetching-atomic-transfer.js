/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import getAtomicTransfer from 'state/selectors/get-atomic-transfer';

/**
 * Returns whether we are already fetching the Atomic transfer for given siteId.
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {?Boolean} whether we are fetching transfer status for given siteId
 */
export default ( state, siteId ) => {
	const transfer = getAtomicTransfer( state, siteId );
	return get( transfer, 'fetchingTransfer', false );
};
