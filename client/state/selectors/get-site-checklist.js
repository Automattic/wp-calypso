import 'calypso/state/checklist/init';

/**
 * Returns the checklist for the specified site ID
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {null|{tasks?: {id: string, isCompleted: boolean}[]}} Site settings
 */
export default function getSiteChecklist( state, siteId ) {
	return state.checklist?.[ siteId ]?.items ?? null;
}
