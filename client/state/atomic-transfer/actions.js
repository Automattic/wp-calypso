/** @format */

/**
 * Internal dependencies
 */

import {
	ATOMIC_LATEST_TRANSFER_REQUEST,
	ATOMIC_TRANSFER_COMPLETE,
	ATOMIC_TRANSFER_INITIATE,
	ATOMIC_TRANSFER_REQUEST,
	ATOMIC_TRANSFER_REQUEST_FAILURE,
	ATOMIC_TRANSFER_SET,
} from 'state/action-types';

/**
 * Query for a specific atomic transfer for a given site.
 *
 * @param {number} siteId     The id of the site to query.
 * @param {number} transferId The id of the transfer record to query.
 * @returns {Object} An action object
 */
export const fetchAtomicTransfer = ( siteId, transferId ) => ( {
	type: ATOMIC_TRANSFER_REQUEST,
	siteId,
	transferId,
} );

/**
 * Query for the latest atomic transfer for a given site.
 *
 * @param {number} siteId     The id of the site to query.
 * @returns {Object} An action object
 */
export const fetchLatestAtomicTransfer = siteId => ( {
	type: ATOMIC_LATEST_TRANSFER_REQUEST,
	siteId,
} );

/**
 * Query the atomic transfers for a given site.
 *
 * @param {number} siteId The id of the site to query.
 * @returns {Object} An action object
 */
export const fetchAtomicTransfers = siteId => ( {
	type: ATOMIC_TRANSFER_REQUEST,
	siteId,
} );

/**
 * Initiate an atomic transfer for a given site.
 *
 * @param {number} siteId The id of the site to query.
 * @param {Object} module The type of transfer trigger. `pluginZip`, `pluginSlug`, or `themeZip` as key.
 * @returns {Object} An action object
 */
export const initiateAtomicTransfer = ( siteId, module ) => ( {
	type: ATOMIC_TRANSFER_INITIATE,
	siteId,
	module,
} );

/**
 * Report a failure of fetching Automated Transfer status (for example, the status
 * endpoint returns 404).
 *
 * @param {number} siteId The site id to which the status belongs
 * @returns {Object} An action object
 */
export const atomicTransferFetchingFailure = siteId => ( {
	type: ATOMIC_TRANSFER_REQUEST_FAILURE,
	siteId,
} );

export const atomicTransferComplete = siteId => ( {
	type: ATOMIC_TRANSFER_COMPLETE,
	siteId,
} );

/**
 *
 * @see state/automated-transfer/constants#transferStates
 *
 * @param {number} siteId The site id to which the status belongs
 * @param {Object} transfer atomic transfer object
 * @returns {Object} An action object
 */
export const setAtomicTransfer = ( siteId, transfer ) => ( {
	type: ATOMIC_TRANSFER_SET,
	siteId,
	transfer,
} );
