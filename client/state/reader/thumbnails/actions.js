/**
 * External dependencies
 */
import debugModule from 'debug';
import getEmbedMetadata from 'get-video-id';
import request from 'superagent';

/**
 * Internal dependencies
 */
import {
	READER_THUMBNAIL_REQUEST,
	READER_THUMBNAIL_REQUEST_SUCCESS,
	READER_THUMBNAIL_REQUEST_FAILURE,
	READER_THUMBNAIL_RECEIVE,
} from 'state/action-types';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:redux:reader-service-thumbnails' );

/**
 * Returns an action object to signal that image objects have been received.
 *
 * @param {String} embedUrl the url of the embed for which the thumbnail was grabbed
 * @param {String} thumbnailUrl the url at which to find the thumbnail for the embed
 * @return {Object} Action object
 */
export function receiveThumbnail( embedUrl, thumbnailUrl ) {
	return {
		type: READER_THUMBNAIL_RECEIVE,
		embedUrl,
		thumbnailUrl,
	};
}

function requestSuccessful( embedUrl ) {
	return {
		type: READER_THUMBNAIL_REQUEST_SUCCESS,
		embedUrl,
	};
}

function requestFailure( embedUrl, error ) {
	return {
		type: READER_THUMBNAIL_REQUEST_FAILURE,
		embedUrl,
		error,
	};
}

/**
 * Triggers a network request to fetch a thumbnail
 *
 * @param  {String} embedUrl -  the url of the embed for which to get the thumbnail
 * @return {Function} Action thunk
 */
export const requestThumbnail = ( embedUrl ) => ( dispatch ) => {
	const { id, service } = getEmbedMetadata( embedUrl ) || {};
	switch ( service ) {
		case 'youtube': {
			const thumbnailUrl = id ? `https://img.youtube.com/vi/${ id }/mqdefault.jpg` : null;
			return receiveThumbnail( embedUrl, thumbnailUrl );
		}
		case 'vimeo': {
			debug( `Requesting thumbnail for embed ${ embedUrl }` );
			dispatch( {
				type: READER_THUMBNAIL_REQUEST,
				embedUrl
			} );

			const fetchUrl = `https://vimeo.com/api/v2/video/${ id }.json`;
			return request.get( fetchUrl )
				.then( response => {
					const thumbnailUrl = response.body[ 0 ].thumbnail_large;

					dispatch( requestSuccessful( embedUrl ) );
					dispatch( receiveThumbnail( embedUrl, thumbnailUrl ) );
				}, error => {
					dispatch( requestFailure( embedUrl, error ) );
				} );
		}
		default:
			return requestFailure( embedUrl, { type: 'UNSUPPORTED_EMBED' } );
	}
};
