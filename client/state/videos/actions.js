/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	VIDEO_REQUEST,
	VIDEO_REQUEST_SUCCESS,
	VIDEO_REQUEST_FAILURE,
	VIDEO_RECEIVE
} from 'state/action-types';

/**
 * Triggers a network request to fetch a video.
 *
 * @param  {String}    guid VideoPress guid
 * @return {Function}  Action thunk
 */
export function requestVideo(guid ) {
	return ( dispatch ) => {
		dispatch( {
			type: VIDEO_REQUEST,
			guid
		} );

		return wpcom.undocumented().videos( guid ).then( ( data ) => {
			dispatch( {
				type: VIDEO_RECEIVE,
				guid,
				data
			} );
			dispatch( {
				type: VIDEO_REQUEST_SUCCESS,
				guid
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: VIDEO_REQUEST_FAILURE,
				guid,
				error
			} );
		} );
	};
}
