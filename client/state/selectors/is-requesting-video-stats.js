/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if current requesting video stat for the specified site ID,
 * video ID or * false otherwise.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @param  {Number}  videoId Video Id
 * @return {Boolean}         Whether the video stats are being requested
 */
export default function isRequestingVideoStats( state, siteId, videoId ) {
	return get( state.stats.videos.requesting, [ siteId, videoId ], false );
}
