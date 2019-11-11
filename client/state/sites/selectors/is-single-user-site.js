/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSite from './get-site';

/**
 * Returns true if site has only a single user, false if the site not a single
 * user site, or null if the site is unknown.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        Whether site is a single user site
 */
export default function isSingleUserSite( state, siteId ) {
	return get( getSite( state, siteId ), 'single_user_site', null );
}
