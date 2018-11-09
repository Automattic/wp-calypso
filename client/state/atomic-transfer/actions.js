/** @format */

/**
 * Internal dependencies
 */

import {
	ATOMIC_TRANSFER_REQUEST as TRANSFER_REQUEST,
	ATOMIC_TRANSFER_REQUEST_FAILURE as TRANSFER_REQUEST_FAILURE,
	ATOMIC_TRANSFER_SET as SET_TRANSFER,
} from 'state/action-types';

import 'state/data-layer/wpcom/sites/atomic/transfer';

/**
 * Query the atomic transfer for a given site.
 *
 * @param {number} siteId The id of the site to query.
 * @returns {Object} An action object
 */
export const fetchAtomicTransfer = siteId => ( {
	type: TRANSFER_REQUEST,
	siteId,
} );

/**
 * Sets the status of an automated transfer for a particular site.
 *
 * If the transfer has been initiated by uploading a plugin, the
 * ID of that plugin is returned in the API response alongside the
 * current status.
 *
 * @see state/automated-transfer/constants#transferStates
 *
 * @param {number} siteId The site id to which the status belongs
 * @param {Object} transfer atomic transfer object
 * @returns {Object} An action object
 */
export const setAtomicTransfer = ( siteId, transfer ) => ( {
	type: SET_TRANSFER,
	siteId,
	transfer,
} );

/**
 * Report a failure of fetching Automated Transfer status (for example, the status
 * endpoint returns 404).
 *
 * @param {number} siteId The site id to which the status belongs
 * @returns {Object} An action object
 */
export const atomicTransferFetchingFailure = siteId => ( {
	type: TRANSFER_REQUEST_FAILURE,
	siteId,
} );
