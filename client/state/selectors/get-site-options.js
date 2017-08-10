/** @format */
/**
 * Internal dependencies
 */
import { getRawSite } from 'state/sites/selectors';

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
	let options = site.options || {};
	const defaultPostFormat = options.default_post_format;
	// The 'standard' post format is saved as an option of '0'
	if ( ! defaultPostFormat || defaultPostFormat === '0' ) {
		options = { ...options, default_post_format: 'standard' };
	}
	return options;
};
