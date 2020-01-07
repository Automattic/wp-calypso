/**
 * Returns true if sites have been loaded in the state
 * @param  {object}  state Global state tree
 * @returns {boolean}       Has sites been loaded
 */
export default function hasLoadedSites( state ) {
	return state.sites.items !== null;
}
