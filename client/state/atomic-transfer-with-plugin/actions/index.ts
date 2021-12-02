import {
	ATOMIC_PLUGIN_INSTALL_INITIATE_WITH_TRANSFER,
	ATOMIC_PLUGIN_INSTALL_INITIATE,
	ATOMIC_PLUGIN_INSTALL_REQUEST_TRANSFER_STATUS,
	ATOMIC_PLUGIN_INSTALL_REQUEST_STATUS,
	ATOMIC_PLUGIN_INSTALL_SET_TRANSFER_STATUS,
	ATOMIC_PLUGIN_INSTALL_SET_STATUS,
} from 'calypso/state/action-types';

/**
 * Initiate Atomic transfer with plugin install.
 *
 * @param {string} softwareSet Software set slug.
 * @param {string} siteId Site ID.
 * @returns {object} An action object.
 */
export const initiateAtomicTransferWithPluginInstall = (
	softwareSet: string,
	siteId: string
) => ( {
	type: ATOMIC_PLUGIN_INSTALL_INITIATE_WITH_TRANSFER,
	siteId,
	softwareSet,
} );

/**
 * Initiate plugin install and activation.
 *
 * @todo Add additional params.
 * @param {string} softwareSet Software set slug.
 * @param {string} siteId Site ID.
 * @returns {object} An action object.
 */
export const initiateAtomicPluginInstall = ( softwareSet: string, siteId: string ) => ( {
	type: ATOMIC_PLUGIN_INSTALL_INITIATE,
	siteId,
	softwareSet,
} );

/**
 * Fetch transfer status.
 *
 * @param {string} siteId Site ID.
 * @returns {object} An action object.
 */
export const requestAtomicTransferStatus = ( siteId: string ) => ( {
	type: ATOMIC_PLUGIN_INSTALL_REQUEST_TRANSFER_STATUS,
	siteId,
} );

/**
 * Fetch install status.
 *
 * @param {string} softwareSet Software set slug.
 * @param {string} siteId Site ID.
 * @returns {object} An action object.
 */
export const requestAtomicInstallStatus = ( softwareSet: string, siteId: string ) => ( {
	type: ATOMIC_PLUGIN_INSTALL_REQUEST_STATUS,
	siteId,
	softwareSet,
} );

/**
 * Set the transfer status.
 *
 * @param {number} siteId The site id to which the status belongs.
 * @param {string} status The new status of the transfer.
 * @param {string} softwareSet The software set slug.
 * @returns {object} An action object
 */
export const setAtomicTransferStatus = (
	siteId: string,
	status: string,
	softwareSet: string
) => ( {
	type: ATOMIC_PLUGIN_INSTALL_SET_TRANSFER_STATUS,
	siteId,
	status,
	softwareSet,
} );

/**
 * Set the install status.
 *
 * @param {number} siteId The site id to which the status belongs.
 * @param {string} status The new status of the transfer.
 * @param {string} softwareSet The software set slug.
 * @returns {object} An action object
 */
export const setAtomicInstallStatus = ( siteId: string, status: string, softwareSet: string ) => ( {
	type: ATOMIC_PLUGIN_INSTALL_SET_STATUS,
	siteId,
	status,
	softwareSet,
} );
