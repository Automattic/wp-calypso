/**
 * External dependencies
 */
import {
	flowRight as compose,
	get,
	includes,
} from 'lodash';

/**
 * Internal dependencies
 */
import { transferStates } from 'state/automated-transfer/constants';

export const getAutomatedTransfer = ( state, siteId ) =>
	get( state, [ 'automatedTransfer', siteId ], {} );

/**
 * Helper to get status state from local transfer state sub-tree
 *
 * @param {Object} state automated transfer state sub-tree for a site
 * @returns {string} status of transfer
 */
export const getStatusData = state => get( state, 'status', null );

/**
 * Returns status info for transfer
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {string|null} status if available else `null`
 */
export const getAutomatedTransferStatus = compose(
	getStatusData,
	getAutomatedTransfer,
);

/**
 * Helper to get eligibility state from local transfer state sub-tree
 *
 * @param {Object} state automated transfer state sub-tree for a site
 * @returns {Object} eligibility information for site
 */
export const getEligibilityData = state => get( state, 'eligibility', { lastUpdate: 0 } );

/**
 * Returns eligibility info for transfer
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {object} eligibility data if available else empty info
 */
export const getEligibility = compose(
	getEligibilityData,
	getAutomatedTransfer,
);

/**
 * Helper to infer eligibility status from local transfer state sub-tree
 *
 * @param {Object} state global app state
 * @returns {boolean} eligibility status for site
 */
export const getEligibilityStatus = state => !! get( state, 'lastUpdated', 0 ) && ! get( state, 'eligibilityHolds', [] );

/**
 * Returns eligibility status for transfer
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {boolean} True if current site is eligible for transfer, otherwise false
 */
export const isEligibleForAutomatedTransfer = compose(
	getEligibilityStatus,
	getEligibility
);

/**
 * Helper to get transferring state from local transfer status
 *
 * @param {string|null} status automated transfer status
 * @returns {bool} transferring check
 */
const getIsTransferring = status => includes(
	[ transferStates.START, transferStates.SETUP ],
	status,
);

/**
 * Checks if the site is currently transferring
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for tranfer info
 * @returns {bool} transferring check
 */
export const isAutomatedTransferTransferring = compose(
	getIsTransferring,
	getAutomatedTransferStatus,
);
