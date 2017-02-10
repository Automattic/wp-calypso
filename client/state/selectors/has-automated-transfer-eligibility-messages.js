/**
 * Internal dependencies
 */
import {
	getAutomatedTransferEligibilityHolds as holds,
	getAutomatedTransferEligibilityWarnings as warnings,
} from 'state/selectors';

/**
 * Determines if there are any eligibility messages to be displayed
 * for the automated transfer of a site.
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {boolean} True if any warnings or holds exist
 */
export default function hasAutomatedTransferEligiblityMessages( state, siteId ) {
	return !! (
		holds( state, siteId ).length +
		warnings( state, siteId ).length
	);
}
