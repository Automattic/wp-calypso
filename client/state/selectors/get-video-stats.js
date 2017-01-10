/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the stats for the for the specified site ID, video ID
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @param  {Number}  videoId Video Id
 * @return {Object}          Stats
 */
export default function getVideoStats( state, siteId, videoId ) {
	return get( state.stats.videos.items, [ siteId, videoId ], null );
}
