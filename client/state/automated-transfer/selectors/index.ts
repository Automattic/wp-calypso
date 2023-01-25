import { flowRight as compose, get } from 'lodash';
import { getAutomatedTransfer } from 'calypso/state/automated-transfer/selectors/get-automated-transfer';
import type { AppState } from 'calypso/types';

import 'calypso/state/automated-transfer/init';

/**
 * Re-exports
 */
export { getAutomatedTransfer } from 'calypso/state/automated-transfer/selectors/get-automated-transfer';
export { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors/get-automated-transfer-status';
export { isAutomatedTransferActive } from 'calypso/state/automated-transfer/selectors/is-automated-transfer-active';
export { isAutomatedTransferFailed } from 'calypso/state/automated-transfer/selectors/is-automated-transfer-failed';
export { default as isFetchingAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors/is-fetching-automated-transfer-status';

export interface DomainNames {
	current: string;
	new: string;
}

export interface EligibilityWarning {
	description: string;
	name: string;
	id: string;
	supportUrl?: string;
	domainNames?: DomainNames;
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
export const getEligibilityData = ( state: AppState ): EligibilityData =>
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
 * @param {Object} state global app state
 * @returns {boolean} eligibility status for site
 */
export const getEligibilityStatus = ( state: AppState ): boolean =>
	!! get( state, 'lastUpdate', 0 ) && ! get( state, 'eligibilityHolds', [] ).length;

/**
 * Returns eligibility status for transfer
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {boolean} True if current site is eligible for transfer, otherwise false
 */
export const isEligibleForAutomatedTransfer = compose( getEligibilityStatus, getEligibility );
