/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';

/**
 * Returns a list of recommended plugins for the given site.
 *
 * @param  {object}                   state   Global state tree
 * @param  {number}                   siteId  The ID of the site we're querying
 * @returns {?Array<object>}                   Array of plugin objects.
 *                                            If null, there's no request in progress.
 */
export default function getRecommendedPlugins( state, siteId ) {
	return get( state, [ 'plugins', 'recommended', siteId ], null );
}
