import {
	ATOMIC_SOFTWARE_INITIATE_INSTALL,
	ATOMIC_SOFTWARE_REQUEST_STATUS,
	ATOMIC_SOFTWARE_SET_STATUS,
} from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/atomic/software';
import 'calypso/state/atomic/init';

export interface AtomicSoftwareStatus {
	blog_id: number;
	software_set: Record< string, { path: string; state: string } >;
	applied: boolean;
}

export interface AtomicSoftwareError {
	name: string; // "NotFoundError"
	status: number; // 404
	message: string; // "Transfer not found"
	code: string; // "no_transfer_record"
}

/**
 * Initiate plugin install and activation.
 *
 * @param {string} siteId Site ID.
 * @param {string} softwareSet Software set slug.
 * @returns {Object} An action object.
 */
export const requestAtomicSoftwareInstall = ( siteId: number, softwareSet: string ) =>
	( {
		type: ATOMIC_SOFTWARE_INITIATE_INSTALL,
		siteId,
		softwareSet,
	} as const );

/**
 * Fetch install status.
 *
 * @param {string} siteId Site ID.
 * @param {string} softwareSet Software set slug.
 * @returns {Object} An action object.
 */
export const requestAtomicSoftwareStatus = ( siteId: number, softwareSet: string ) =>
	( {
		type: ATOMIC_SOFTWARE_REQUEST_STATUS,
		siteId,
		softwareSet,
	} as const );

/**
 * Set the install status.
 *
 * @param {number} siteId The site id to which the status belongs.
 * @param {string} softwareSet The software set slug.
 * @param {Object} status The new status of the transfer.
 * @returns {Object} An action object
 */
export const setAtomicSoftwareStatus = (
	siteId: number,
	softwareSet: string,
	status: AtomicSoftwareStatus
) =>
	( {
		type: ATOMIC_SOFTWARE_SET_STATUS,
		siteId,
		softwareSet,
		status,
	} as const );

/**
 * Set the install error.
 *
 * @param {number} siteId The site id to which the status belongs.
 * @param {string} softwareSet The software set slug.*
 * @param {AtomicSoftwareError} error The error of the install.
 * @returns {Object} An action object
 */
export const setAtomicSoftwareError = (
	siteId: number,
	softwareSet: string,
	error: AtomicSoftwareError
) =>
	( {
		type: ATOMIC_SOFTWARE_SET_STATUS,
		siteId,
		softwareSet,
		error,
	} as const );

/**
 * Clean the install status.
 *
 * @param {number} siteId The site id to which the status belongs.
 * @param {string} softwareSet The software set slug.*
 * @returns {Object} An action object
 */
export const cleanAtomicSoftwareStatus = ( siteId: number, softwareSet: string ) =>
	( {
		type: ATOMIC_SOFTWARE_SET_STATUS,
		siteId,
		softwareSet,
		status: null,
		error: null,
	} as const );
