/** @ssr-ready **/

/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';

/**
 * Returns the site object for the currently selected site.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Object}        Selected site
 */
export function getSelectedSite( state ) {
	const siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		return null;
	}

	return getSite( state, siteId );
}

/**
 * Returns the currently selected site ID.
 *
 * @param  {Object}  state Global state tree
 * @return {?Number}       Selected site ID
 */
export function getSelectedSiteId( state ) {
	return state.ui.selectedSiteId;
}

/**
 * Returns the current section.
 *
 * @param  {Object}  state Global state tree
 * @return {?Object}       Current section
 *
 * @see client/sections
 */
export function getSection( state ) {
	return state.ui.section;
}
