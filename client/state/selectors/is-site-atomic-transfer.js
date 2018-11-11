/** @format */

/**
 * External dependencies
 */

import { get, isEmpty } from 'lodash';

/**
 * Internal Dependencies
 */
import { getAtomicTransfer } from 'state/atomic-transfer/selectors';

/**
 * Returns whether we are already fetching the Atomic transfer for given siteId.
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {?Boolean} whether we are fetching transfer status for given siteId
 */
export default ( state, siteId ) => {
	if ( ! siteId ) {
		return null;
	}

	const transfer = getAtomicTransfer( state, siteId );

	if ( ! transfer || isEmpty( transfer ) ) {
		return null;
	}

	return get( transfer, 'fetchingTransfer', false );
};
