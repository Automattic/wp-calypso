/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the requesting status of the recommended plugins request for the given site.
 *
 * @param  {Object}    state   Global state tree
 * @param  {Number}    siteId  The ID of the site we're querying
 * @return {Boolean}           True if requesting and false otherwise
 */
export default function isRequestingRecommendedPlugins( state, siteId ) {
	return get( state, [ 'plugins', 'recommended', siteId, 'isRequesting' ], false );
}
