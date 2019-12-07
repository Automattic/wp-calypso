/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteOptions from 'state/selectors/get-site-options';

/**
 * Returns WordPress version of currently selected site.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?String}        WordPress version of selected site
 */
export default function getWordPressVersion( state, siteId ) {
	const siteOptions = getSiteOptions( state, siteId );
	return get( siteOptions, 'software_version' );
}
