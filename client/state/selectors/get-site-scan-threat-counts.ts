/**
 * External dependencies
 */
import { AppState } from 'calypso/types';

/**
 * Internal dependencies
 */
import 'calypso/state/data-layer/wpcom/sites/scan';

export type JetpackScanThreatCounts = {
	// Just-discovered threats
	new?: number;

	// Threats from previous scans, but which haven't been addressed
	notified?: number;

	// Threats that have been ignored
	ignored?: number;

	// Threats that have successfully been fixed
	fixed?: number;
};

const NO_INFO: JetpackScanThreatCounts = {};

/**
 * Returns a count of all threats Jetpack Scan has discovered for a site, by status.
 * Returns an empty object if the site is unknown, or there is no information yet.
 *
 * @param  {object}   state    		Global state tree
 * @param  {number}   siteId   		The ID of the site we're querying
 * @returns {JetpackScanThreatCounts} Threat counts, by status
 */
export default function getSiteScanThreatCounts(
	state: AppState,
	siteId: number
): JetpackScanThreatCounts {
	return state.jetpackScan.threatCounts.data?.[ siteId ] || NO_INFO;
}
