/**
 * Internal dependencies
 */
import {
	AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST,
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE,
	AUTOMATED_TRANSFER_STATUS_SET,
} from 'state/action-types';

/**
 * Sets the status of an automated transfer for a particular site
 *
 * @see state/automated-transfer/constants#transferStates
 *
 * @param {number} siteId The site id to which the status belongs
 * @param {string} status The new status of the automated transfer
 * @returns {Object} An action object
 */
export const setAutomatedTransferStatus = ( siteId, status ) => ( {
	type: AUTOMATED_TRANSFER_STATUS_SET,
	siteId,
	status,
} );

/**
 * Indicates that we need the eligibility information for a given site
 *
 * @param {number} siteId site for requested information
 * @returns {Object} Redux action
 */
export const requestEligibility = siteId => ( {
	type: AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST,
	siteId,
} );

/**
 * Merges given eligibility information into the app state
 *
 * @see state/automated-transfer/eligibility/reducer
 *
 * @param {number} siteId Site to which the information belongs
 * @param {Object} data eligibility information to be merged into existing state
 * @returns {Object} Redux action
 */
export const updateEligibility = ( siteId, { eligibilityHolds, eligibilityWarnings, lastUpdate, status } ) => ( {
	type: AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE,
	eligibilityHolds,
	eligibilityWarnings,
	lastUpdate,
	siteId,
	status,
} );
