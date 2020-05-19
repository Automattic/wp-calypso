/**
 * External dependencies
 */
import { flowRight as compose, get } from 'lodash';

/**
 * Internal dependencies
 */
import { getAutomatedTransfer } from 'state/automated-transfer/selectors/get-automated-transfer';

import 'state/automated-transfer/init';

/**
 * Re-exports
 */
export { getAutomatedTransfer } from 'state/automated-transfer/selectors/get-automated-transfer';
export { getAutomatedTransferStatus } from 'state/automated-transfer/selectors/get-automated-transfer-status';
export { isAutomatedTransferActive } from 'state/automated-transfer/selectors/is-automated-transfer-active';
export { isAutomatedTransferFailed } from 'state/automated-transfer/selectors/is-automated-transfer-failed';
export { default as isFetchingAutomatedTransferStatus } from 'state/automated-transfer/selectors/is-fetching-automated-transfer-status';

export interface EligibilityWarning {
	description: string;
	name: string;
	supportUrl?: string;
}

export interface EligibilityData {
	lastUpdate: number;
	eligibilityHolds?: string[];
	eligibilityWarnings?: EligibilityWarning[];
}

/**
 * Helper to get eligibility state from local transfer state sub-tree
 *
 * @param state automated transfer state sub-tree for a site
 * @returns eligibility information for site
 */
export const getEligibilityData = ( state ): EligibilityData =>
	get( state, 'eligibility', { lastUpdate: 0 } );

/**
 * Returns eligibility info for transfer
 *
 * @param state global app state
 * @param siteId requested site for transfer info
 * @returns eligibility data if available else empty info
 */
export const getEligibility = compose( getEligibilityData, getAutomatedTransfer );

/**
 * Helper to infer eligibility status from local transfer state sub-tree
 *
 * @param {object} state global app state
 * @returns {boolean} eligibility status for site
 */
export const getEligibilityStatus = ( state ) =>
	!! get( state, 'lastUpdate', 0 ) && ! get( state, 'eligibilityHolds', [] ).length;

/**
 * Returns eligibility status for transfer
 *
 * @param {object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {boolean} True if current site is eligible for transfer, otherwise false
 */
export const isEligibleForAutomatedTransfer = compose( getEligibilityStatus, getEligibility );
