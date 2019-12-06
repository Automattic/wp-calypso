/**
 * External dependencies
 */

import { flowRight as compose, get } from 'lodash';

/**
 * Returns automated transfer info for site
 *
 * @param {object} state global app state
 * @param {?number} siteId requested site for transfer info
 * @returns {object} automated transfer data if available else empty info
 */
export const getAutomatedTransfer = ( state, siteId ) =>
	get( state, [ 'automatedTransfer', siteId ], {} );

/**
 * Helper to get status state from local transfer state sub-tree
 *
 * @param {object} state automated transfer state sub-tree for a site
 * @returns {string} status of transfer
 */
export const getStatusData = state => get( state, 'status', null );

/**
 * Returns status info for transfer
 *
 * @param {object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {string|null} status if available else `null`
 */
export const getAutomatedTransferStatus = compose( getStatusData, getAutomatedTransfer );

/**
 * @typedef EligibilityWarning
 * @property {string} description
 * @property {string} name
 * @property {string=} supportUrl
 */

/**
 * @typedef EligibilityData
 * @property {number} lastUpdate
 * @property {string[]=} eligibilityHolds
 * @property {EligibilityWarning[]=} eligibilityWarnings
 */

/**
 * Helper to get eligibility state from local transfer state sub-tree
 *
 * @param {object} state automated transfer state sub-tree for a site
 * @returns {EligibilityData} eligibility information for site
 */
export const getEligibilityData = state => get( state, 'eligibility', { lastUpdate: 0 } );

/**
 * Returns eligibility info for transfer
 *
 * @param {object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {object} eligibility data if available else empty info
 */
export const getEligibility = compose( getEligibilityData, getAutomatedTransfer );

/**
 * Helper to infer eligibility status from local transfer state sub-tree
 *
 * @param {object} state global app state
 * @returns {boolean} eligibility status for site
 */
export const getEligibilityStatus = state =>
	!! get( state, 'lastUpdate', 0 ) && ! get( state, 'eligibilityHolds', [] ).length;

/**
 * Returns eligibility status for transfer
 *
 * @param {object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {boolean} True if current site is eligible for transfer, otherwise false
 */
export const isEligibleForAutomatedTransfer = compose( getEligibilityStatus, getEligibility );
