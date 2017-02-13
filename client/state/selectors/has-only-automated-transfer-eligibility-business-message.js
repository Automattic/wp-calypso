/**
 * External dependencies
 */
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getAutomatedTransferEligibilityHolds,
	getAutomatedTransferEligibilityWarnings,
} from 'state/selectors';

/**
 * Determines if the one and only eligibility message that exists for
 * the automated transfer of a site is a hold due to a missing business
 * plan.
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {boolean} True if only message is missing business plan
 */
export default function hasOnlyAutomatedTransferEligiblityBusinessMessage( state, siteId ) {
	const holds = getAutomatedTransferEligibilityHolds( state, siteId );
	const warnings = getAutomatedTransferEligibilityWarnings( state, siteId );

	return warnings.length === 0 && isEqual( holds, [ 'NO_BUSINESS_PLAN' ] );
}
