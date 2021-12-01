import { INITIATE_ATOMIC_TRANSFER_WITH_PLUGIN_INSTALL } from 'calypso/state/action-types';

/**
 * Initiate Atomic transfer with plugin install.
 *
 * @param {string} softwareSet Software set slug.
 * @returns {object} An action object
 */
export const initiateAtomicTransferWithPluginInstall = (
	softwareSet: string,
	siteId: string
) => ( {
	type: INITIATE_ATOMIC_TRANSFER_WITH_PLUGIN_INSTALL,
	siteId,
	softwareSet,
} );

// Initiate plugin install and activation (same as transfer but might need extra params?)

// Fetch transfer + plugin state
