/** @format */
/**
 * Returns true if site selection has occured, else false
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Has site selection occurred
 */
export default function hasInitializedSites( state ) {
	return state.ui.siteSelectionInitialized;
}
