/**
 * Returns true if sites have been loaded in the state
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Has sites been loaded
 */
export default function hasLoadedSites( state ) {
	return state.sites.items !== null;
}
