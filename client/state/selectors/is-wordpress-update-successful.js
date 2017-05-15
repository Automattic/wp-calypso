/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the WordPress core update status of a site.
 * Returns null if the site is unknown, or WordPress core hasn't been updated yet.
 *
 * @param  {Object}    state   Global state tree
 * @param  {Number}    siteId  The ID of the site we're querying
 * @return {?Boolean}          Whether WordPress core update was successful.
 */
export default function isWordpressUpdateSuccessful( state, siteId ) {
	return get( state, [ 'sites', 'updates', 'wordpressUpdateStatus', siteId ], null );
}
