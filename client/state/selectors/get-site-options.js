/** @format */

/**
 * Internal dependencies
 */

import { getRawSite } from 'state/sites/selectors';

const EMTPY_OPTIONS = Object.freeze( {} );

/**
 * Returns the site options
 *
 * @param    {Object}    state    Global state tree
 * @param    {Number}    siteId   Site ID
 * @returns  {?Object}            Site options or null
 */
export default ( state, siteId ) => {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}
	return site.options || EMTPY_OPTIONS;
};
