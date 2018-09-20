/** @format */
/**
 * External dependencies
 */
import debugModule from 'debug';
import getEmbedMetadata from 'get-video-id';
import request from 'superagent';
import { get } from 'lodash';

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
export const UNSUPPORTED_EMBED = 'UNSUPPORTED_EMBED';
export const BAD_API_RESPONSE = 'BAD_API_RESPONSE';

/**
 * Returns an action object to signal that a thumbnailUrl has been received.
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
 * Either instantly returns an action for the thumbnail info or
 * triggers a network request to fetch a thumbnailUrl if necessary
 *
 * @param  {String} embedUrl -  the url of the embed for which to get the thumbnail
 * @return {Function|Object} Action thunk | Action object
 */
export const requestThumbnail = embedUrl => dispatch => {
	const { id, service } = getEmbedMetadata( embedUrl ) || {};
	switch ( service ) {
		case 'youtube': {
			const thumbnailUrl = `https://img.youtube.com/vi/${ id }/mqdefault.jpg`;
			dispatch( receiveThumbnail( embedUrl, thumbnailUrl ) );
			return Promise.resolve();
		}
		case 'videopress': {
			const thumbnailUrl = `https://thumbs.videopress.com/${ id }?c=1`;
			dispatch( receiveThumbnail( embedUrl, thumbnailUrl ) );
			return Promise.resolve();
		}
		case 'vimeo': {
			debug( `Requesting thumbnail for embed ${ embedUrl }` );
			dispatch( {
				type: READER_THUMBNAIL_REQUEST,
				embedUrl,
			} );

			const fetchUrl = `https://vimeo.com/api/v2/video/${ id }.json`;
			return request.get( fetchUrl ).then(
				response => {
					const thumbnailUrl = get( response, [ 'body', 0, 'thumbnail_large' ] );
					if ( thumbnailUrl ) {
						dispatch( requestSuccessful( embedUrl ) );
						dispatch( receiveThumbnail( embedUrl, thumbnailUrl ) );
					} else {
						dispatch( requestFailure( embedUrl, { type: BAD_API_RESPONSE, response } ) );
					}
				},
				error => {
					dispatch( requestFailure( embedUrl, error ) );
				}
			);
		}
		default:
			dispatch( requestFailure( embedUrl, { type: UNSUPPORTED_EMBED } ) );
			return Promise.resolve();
	}
};
