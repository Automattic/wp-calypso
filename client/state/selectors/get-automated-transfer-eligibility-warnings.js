/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getEligibility } from 'state/automated-transfer/selectors';

/**
 * Returns any warnings about functionality that would be
 * lost after a site goes through the automated transfer
 * process.
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {Array} Any warnings that exist
 */
export default function getAutomatedTransferEligiblityWarnings( state, siteId ) {
	const eligibilityData = getEligibility( state, siteId );
	return get( eligibilityData, 'eligibilityWarnings', [] );
}
