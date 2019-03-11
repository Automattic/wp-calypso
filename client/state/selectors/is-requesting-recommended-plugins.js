/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns a list of recommended plugins for the given site.
 * TODO: Update documentation here
 * Returns null if the site is unknown, or monitor settings haven't been received yet.
 *
 * @param  {Object}    state   Global state tree
 * @param  {Number}    siteId  The ID of the site we're querying
 * @return {?Object}           The monitor settings of that site
 */
export default function isRequestingRecommendedPlugins( state, siteId ) {
	return get( state, [ 'plugins', 'recommended', siteId, 'isRequesting' ], null );
}
