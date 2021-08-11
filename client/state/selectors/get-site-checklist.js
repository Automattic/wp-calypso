/**
 * Internal dependencies
 */
import 'calypso/state/checklist/init';

/**
 * Returns the checklist for the specified site ID
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {object}        Site settings
 */
export default function getSiteChecklist( state, siteId ) {
	return state.checklist?.[ siteId ]?.items ?? null;
}
