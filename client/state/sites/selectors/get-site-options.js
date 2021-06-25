/**
 * Internal dependencies
 */

import getRawSite from 'calypso/state/selectors/get-raw-site';

const EMPTY_OPTIONS = Object.freeze( {} );

/**
 * Returns the site options
 *
 * @param    {object}    state    Global state tree
 * @param    {number}    siteId   Site ID
 * @returns  {?object}            Site options or null
 */
export default ( state, siteId ) => {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}
	return site.options || EMPTY_OPTIONS;
};
