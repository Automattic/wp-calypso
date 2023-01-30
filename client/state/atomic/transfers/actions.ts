import {
	ATOMIC_TRANSFER_INITIATE_TRANSFER,
	ATOMIC_TRANSFER_REQUEST_LATEST,
	ATOMIC_TRANSFER_SET_LATEST,
} from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/atomic/transfers';
import 'calypso/state/data-layer/wpcom/sites/atomic/transfers/latest';
import 'calypso/state/atomic/init';

export interface AtomicTransfer {
	atomic_transfer_id: number;
	blog_id: number;
	status: string;
	created_at: string;
	is_stuck: boolean;
	is_stuck_reset: boolean;
	in_lossless_revert: boolean;
}

export interface AtomicTransferError {
	name: string; // "NotFoundError"
	status: number; // 404
	message: string; // "Transfer not found"
	code: string; // "no_transfer_record"
}

/**
 * Initiate Atomic transfer, optionally with software set install.
 *
 * @param {string} siteId Site ID.
 * @param {Object} options Transfer options.
 * @param {string} options.softwareSet Software set to install.
 * @returns {Object} An action object.
 */
export const initiateAtomicTransfer = (
	siteId: number,
	{ softwareSet }: { softwareSet: string }
) =>
	( {
		type: ATOMIC_TRANSFER_INITIATE_TRANSFER,
		siteId,
		softwareSet,
	} as const );

/**
 * Fetch transfer.
 *
 * @param {string} siteId Site ID.
 * @returns {Object} An action object.
 */
export const requestLatestAtomicTransfer = ( siteId: number ) =>
	( {
		type: ATOMIC_TRANSFER_REQUEST_LATEST,
		siteId,
	} as const );

/**
 * Set the transfer.
 *
 * @param {number} siteId The site id to which the status belongs.
 * @param {Object} transfer The new status of the transfer.
 * @returns {Object} An action object
 */
export const setLatestAtomicTransfer = ( siteId: number, transfer: AtomicTransfer ) =>
	( {
		type: ATOMIC_TRANSFER_SET_LATEST,
		siteId,
		transfer,
	} as const );

export const setLatestAtomicTransferError = ( siteId: number, error: AtomicTransferError ) =>
	( {
		type: ATOMIC_TRANSFER_SET_LATEST,
		siteId,
		error,
	} as const );
