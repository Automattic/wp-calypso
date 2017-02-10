/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getEligibility } from 'state/automated-transfer/selectors';

/**
 * Returns any blocking reasons why a site is not eligible
 * for automated transfer.
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {Array} Any holds that exist
 */
export default function getAutomatedTransferEligiblityHolds( state, siteId ) {
	const eligibilityData = getEligibility( state, siteId );
	return get( eligibilityData, 'eligibilityHolds', [] );
}
