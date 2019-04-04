/** @format */

/**
 * Internal dependencies
 */

import getRawSite from 'state/selectors/get-raw-site';

const EMPTY_OPTIONS = Object.freeze( {} );

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
	return site.options || EMPTY_OPTIONS;
};
