import 'calypso/state/checklist/init';

/**
 * Returns the checklist for the specified site ID
 *
 * @typedef { import("../checklist/types").Checklist } Checklist
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {Checklist|null} Site settings
 */
export default function getSiteChecklist( state, siteId ) {
	return state.checklist?.[ siteId ]?.items ?? null;
}
