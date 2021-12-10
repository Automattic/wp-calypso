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
	status?: string;
	// transfer?: AtomicTransfer;
}

// interface AtomicTransfer {
// 	atomic_transfer_id: number;
// 	blog_id: number;
// 	status: string;
// 	created_at: string;
// 	is_stuck: boolean;
// 	is_stuck_reset: boolean;
// 	in_lossless_revert: boolean;
// }

/**
 * Initiate Atomic transfer with plugin install.
 *
 * @param {string} siteId Site ID.
 * @param {string} softwareSet Software set slug.
 * @returns {object} An action object.
 */
export const initiateAtomicTransferWithPluginInstall = (
	siteId: number,
	softwareSet: string
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
 * Fetch transfer status.
 *
 * @param {string} siteId Site ID.
 * @returns {object} An action object.
 */
export const requestAtomicTransferStatus = ( siteId: number ): AtomicTransferAction => ( {
	type: ATOMIC_PLUGIN_INSTALL_REQUEST_TRANSFER_STATUS,
	siteId,
} );

/**
 * Set the transfer status.
 *
 * @param {number} siteId The site id to which the status belongs.
 * @param {object} status The new status of the transfer.
 * @returns {object} An action object
 */
export const setAtomicTransferStatus = (
	siteId: number,
	status: string
): AtomicTransferAction => ( {
	type: ATOMIC_PLUGIN_INSTALL_SET_TRANSFER_STATUS,
	siteId,
	status,
} );
