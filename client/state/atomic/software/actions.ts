import {
	ATOMIC_PLUGIN_INSTALL_INITIATE,
	ATOMIC_PLUGIN_INSTALL_REQUEST_STATUS,
	ATOMIC_PLUGIN_INSTALL_SET_STATUS,
} from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/atomic/software';
import 'calypso/state/atomic/init';

interface AtomicSoftwareAction {
	type:
		| typeof ATOMIC_PLUGIN_INSTALL_INITIATE
		| typeof ATOMIC_PLUGIN_INSTALL_REQUEST_STATUS
		| typeof ATOMIC_PLUGIN_INSTALL_SET_STATUS;
	siteId: number;
	softwareSet: string;
	status?: AtomicSoftwareStatus;
	meta?: { dataLayer?: { trackRequest: boolean; requestKey: string } };
}

export interface AtomicSoftwareStatus {
	blog_id: number;
	software_set: Record< string, { path: string; state: string } >;
	applied: boolean;
	error?: string;
}

/**
 * Initiate plugin install and activation.
 *
 * @param {string} siteId Site ID.
 * @param {string} softwareSet Software set slug.
 * @returns {object} An action object.
 */
export const requestAtomicSoftwareInstall = (
	siteId: number,
	softwareSet: string
): AtomicSoftwareAction => ( {
	type: ATOMIC_PLUGIN_INSTALL_INITIATE,
	siteId,
	softwareSet,
	meta: {
		dataLayer: {
			trackRequest: true,
			requestKey: `${ ATOMIC_PLUGIN_INSTALL_INITIATE }-${ siteId }-${ softwareSet }`,
		},
	},
} );

/**
 * Fetch install status.
 *
 * @param {string} siteId Site ID.
 * @param {string} softwareSet Software set slug.
 * @returns {object} An action object.
 */
export const requestAtomicSoftwareStatus = (
	siteId: number,
	softwareSet: string
): AtomicSoftwareAction => ( {
	type: ATOMIC_PLUGIN_INSTALL_REQUEST_STATUS,
	siteId,
	softwareSet,
} );

/**
 * Set the install status.
 *
 * @param {number} siteId The site id to which the status belongs.
 * @param {string} softwareSet The software set slug.
 * @param {object} status The new status of the transfer.
 * @returns {object} An action object
 */
export const setAtomicSoftwareStatus = (
	siteId: number,
	softwareSet: string,
	status: AtomicSoftwareStatus
): AtomicSoftwareAction => ( {
	type: ATOMIC_PLUGIN_INSTALL_SET_STATUS,
	siteId,
	softwareSet,
	status,
} );
