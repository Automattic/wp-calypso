/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	VIDEO_FETCH,
	VIDEO_FETCH_COMPLETED,
	VIDEO_FETCH_FAILED,
	VIDEO_RECEIVE
} from 'state/action-types';

/**
 * Triggers a network request to fetch a video.
 *
 * @param  {String}    guid VideoPress guid
 * @return {Function}       a promise that will resolve once fetching is completed
 */
export function fetchVideo( guid ) {
	return ( dispatch ) => {
		dispatch( {
			type: VIDEO_FETCH,
			guid
		} );

		return wpcom.undocumented().videos( guid ).then( ( data ) => {
			dispatch( {
				type: VIDEO_RECEIVE,
				guid,
				data
			} );
			dispatch( {
				type: VIDEO_FETCH_COMPLETED,
				guid
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: VIDEO_FETCH_FAILED,
				guid,
				error
			} );
		} );
	};
}
