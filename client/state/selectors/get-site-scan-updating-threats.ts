import 'calypso/state/data-layer/wpcom/sites/scan';
import type { AppState } from 'calypso/types';

/**
 * Returns an array of threat IDs from threats that are being updated (fixing/ignoring).
 * Returns an empty array if the site is unknown, or there is no information yet.
 *
 * @param  {Object}   state    Global state tree
 * @param  {number}   siteId   The ID of the site we're querying
 * @returns {number[]}         Array of threat IDs
 */
export default function getSiteScanUpdatingThreats( state: AppState, siteId: number ): number[] {
	return state.jetpackScan.threats?.updating?.[ siteId ] ?? [];
}
