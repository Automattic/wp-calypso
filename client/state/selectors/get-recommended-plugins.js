/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns a list of recommended plugins for the given site.
 *
 * @param  {Object}                   state   Global state tree
 * @param  {Number}                   siteId  The ID of the site we're querying
 * @return {?Array<Object>|undefined}         Array of plugin objects.
 *                                            If null, there's a network request in progress.
 *                                            If undefined, there's no request in progress.
 */
export default function getRecommendedPlugins( state, siteId ) {
	return get( state, [ 'plugins', 'recommended', siteId ] );
}
