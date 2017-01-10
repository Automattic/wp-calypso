/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	VIDEO_STATS_RECEIVE,
	VIDEO_STATS_REQUEST,
	VIDEO_STATS_REQUEST_FAILURE,
	VIDEO_STATS_REQUEST_SUCCESS
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that video stat for a site,
 * video and stat have been received.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} videoId Video Id
 * @param  {Array}  stats  The received stats
 * @return {Object}        Action object
 */
export function receiveVideoStats( siteId, videoId, stats ) {
	return {
		type: VIDEO_STATS_RECEIVE,
		siteId,
		videoId,
		stats,
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve video stat for a site and a video.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} videoId Video Id
 * @return {Function}      Action thunk
 */
export function requestVideoStats( siteId, videoId ) {
	return ( dispatch ) => {
		dispatch( {
			type: VIDEO_STATS_REQUEST,
			videoId,
			siteId
		} );

		return wpcom.site( siteId )
			.statsVideo( videoId )
			.then( ( { data } ) => {
				dispatch( receiveVideoStats( siteId, videoId, data ) );
				dispatch( {
					type: VIDEO_STATS_REQUEST_SUCCESS,
					siteId,
					videoId
				} );
			} )
			.catch( error => {
				dispatch( {
					type: VIDEO_STATS_REQUEST_FAILURE,
					siteId,
					videoId,
					error
				} );
			} );
	};
}
