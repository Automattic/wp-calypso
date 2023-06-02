import { ATOMIC_TRANSFER_REQUEST, ATOMIC_TRANSFER_SET } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/transfers/latest';
import 'calypso/state/atomic-transfer/init';

/**
 * Query the atomic transfer for a given site.
 *
 * @param {number} siteId The id of the site to query.
 * @returns {Object} An action object
 */
export const fetchAtomicTransfer = ( siteId ) => ( {
	type: ATOMIC_TRANSFER_REQUEST,
	siteId,
} );

/**
 *
 * @see state/automated-transfer/constants#transferStates
 * @param {number} siteId The site id to which the status belongs
 * @param {Object} transfer atomic transfer object
 * @returns {Object} An action object
 */
export const setAtomicTransfer = ( siteId, transfer ) => ( {
	type: ATOMIC_TRANSFER_SET,
	siteId,
	transfer,
} );
