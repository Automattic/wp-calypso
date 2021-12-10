import {
	ATOMIC_PLUGIN_INSTALL_INITIATE_WITH_TRANSFER,
	ATOMIC_PLUGIN_INSTALL_REQUEST_TRANSFER_STATUS,
	ATOMIC_PLUGIN_INSTALL_SET_TRANSFER_STATUS,
} from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/atomic/transfers';
import 'calypso/state/data-layer/wpcom/sites/atomic/transfers/latest';
import 'calypso/state/atomic/init';

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
) => ( {
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
export const requestAtomicTransferStatus = ( siteId: number ) => ( {
	type: ATOMIC_PLUGIN_INSTALL_REQUEST_TRANSFER_STATUS,
	siteId,
} );

/**
 * Set the transfer status.
 *
 * @param {number} siteId The site id to which the status belongs.
 * @param {string} softwareSet The software set slug.
 * @param {string} status The new status of the transfer.
 * @returns {object} An action object
 */
export const setAtomicTransferStatus = ( siteId: number, status: any ) => ( {
	type: ATOMIC_PLUGIN_INSTALL_SET_TRANSFER_STATUS,
	siteId,
	status,
} );
