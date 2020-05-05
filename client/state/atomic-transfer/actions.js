/**
 * Internal dependencies
 */

import {
	ATOMIC_TRANSFER_REQUEST,
	ATOMIC_TRANSFER_REQUEST_FAILURE,
	ATOMIC_TRANSFER_COMPLETE,
	ATOMIC_TRANSFER_SET,
} from 'state/action-types';

import 'state/data-layer/wpcom/sites/transfers/latest';

/**
 * Query the atomic transfer for a given site.
 *
 * @param {number} siteId The id of the site to query.
 * @returns {object} An action object
 */
export const fetchAtomicTransfer = ( siteId ) => ( {
	type: ATOMIC_TRANSFER_REQUEST,
	siteId,
} );

/**
 * Report a failure of fetching Automated Transfer status (for example, the status
 * endpoint returns 404).
 *
 * @param {number} siteId The site id to which the status belongs
 * @returns {object} An action object
 */
export const atomicTransferFetchingFailure = ( siteId ) => ( {
	type: ATOMIC_TRANSFER_REQUEST_FAILURE,
	siteId,
} );

export const atomicTransferComplete = ( siteId ) => ( {
	type: ATOMIC_TRANSFER_COMPLETE,
	siteId,
} );

/**
 *
 * @see state/automated-transfer/constants#transferStates
 *
 * @param {number} siteId The site id to which the status belongs
 * @param {object} transfer atomic transfer object
 * @returns {object} An action object
 */
export const setAtomicTransfer = ( siteId, transfer ) => ( {
	type: ATOMIC_TRANSFER_SET,
	siteId,
	transfer,
} );
