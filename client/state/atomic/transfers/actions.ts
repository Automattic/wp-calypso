import {
	ATOMIC_PLUGIN_INSTALL_INITIATE_WITH_TRANSFER,
	ATOMIC_PLUGIN_INSTALL_REQUEST_TRANSFER_STATUS,
	ATOMIC_PLUGIN_INSTALL_SET_TRANSFER_STATUS,
} from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/atomic/transfers';
import 'calypso/state/data-layer/wpcom/sites/atomic/transfers/latest';
import 'calypso/state/atomic/init';

interface AtomicTransferAction {
	type:
		| typeof ATOMIC_PLUGIN_INSTALL_INITIATE_WITH_TRANSFER
		| typeof ATOMIC_PLUGIN_INSTALL_REQUEST_TRANSFER_STATUS
		| typeof ATOMIC_PLUGIN_INSTALL_SET_TRANSFER_STATUS;
	siteId: number;
	softwareSet?: string;
	meta?: { dataLayer?: { trackRequest: boolean; requestKey: string } };
	transfer?: AtomicTransfer;
}

export interface AtomicTransfer {
	atomic_transfer_id: number;
	blog_id: number;
	status: string;
	created_at: string;
	is_stuck: boolean;
	is_stuck_reset: boolean;
	in_lossless_revert: boolean;
	error?: string;
}

/**
 * Initiate Atomic transfer, optionally with software set install.
 *
 * @param {string} siteId Site ID.
 * @param {object} options Transfer options.
 * @param {string} options.softwareSet Software set to install.
 * @returns {object} An action object.
 */
export const initiateAtomicTransfer = (
	siteId: number,
	{ softwareSet }: { softwareSet: string }
): AtomicTransferAction => ( {
	type: ATOMIC_PLUGIN_INSTALL_INITIATE_WITH_TRANSFER,
	siteId,
	softwareSet,
	meta: {
		dataLayer: {
			trackRequest: true,
			requestKey: `${ ATOMIC_PLUGIN_INSTALL_INITIATE_WITH_TRANSFER }-${ siteId }-${ softwareSet }`,
		},
	},
} );

/**
 * Fetch transfer.
 *
 * @param {string} siteId Site ID.
 * @returns {object} An action object.
 */
export const requestLatestAtomicTransfer = ( siteId: number ): AtomicTransferAction => ( {
	type: ATOMIC_PLUGIN_INSTALL_REQUEST_TRANSFER_STATUS,
	siteId,
} );

/**
 * Set the transfer.
 *
 * @param {number} siteId The site id to which the status belongs.
 * @param {object} transfer The new status of the transfer.
 * @returns {object} An action object
 */
export const setLatestAtomicTransfer = (
	siteId: number,
	transfer: AtomicTransfer
): AtomicTransferAction => ( {
	type: ATOMIC_PLUGIN_INSTALL_SET_TRANSFER_STATUS,
	siteId,
	transfer,
} );
