/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/atomic-transfer/init';

/**
 * Returns whether we are already fetching the Atomic transfer for given siteId.
 *
 * @param {object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {?boolean} whether we are fetching transfer status for given siteId
 */
export default ( state, siteId ) => {
	return get( state, [ 'atomicTransfer', siteId, 'fetchingTransfer' ], false );
};
