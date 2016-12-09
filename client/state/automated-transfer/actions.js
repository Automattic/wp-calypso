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
 * @param {number} siteId The site id to which the status belongs
 * @param {Object} automatedTransferStatus The new status of the automated transfer
 * @returns {Object} An action object
 */
export const setAutomatedTransferStatus = ( siteId, automatedTransferStatus ) => ( {
	type: AUTOMATED_TRANSFER_STATUS_SET,
	siteId,
	automatedTransferStatus,
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

export const updateEligibility = ( domain, data ) => ( {
	type: AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE,
	domain,
	siteId,
	data,
} );

