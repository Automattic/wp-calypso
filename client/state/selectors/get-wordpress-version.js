/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteOptions from 'calypso/state/selectors/get-site-options';

/**
 * Returns WordPress version of currently selected site.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?string}        WordPress version of selected site
 */
export default function getWordPressVersion( state, siteId ) {
	const siteOptions = getSiteOptions( state, siteId );
	return get( siteOptions, 'software_version' );
}
