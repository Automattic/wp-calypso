/**
 * External dependencies
 */
import debugModule from 'debug';
import getEmbedMetadata from 'get-video-id';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_THUMBNAIL_REQUEST,
	READER_THUMBNAIL_REQUEST_SUCCESS,
	READER_THUMBNAIL_REQUEST_FAILURE,
	READER_THUMBNAIL_RECEIVE,
} from 'state/reader/action-types';

import 'state/reader/init';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:redux:reader-service-thumbnails' );
export const UNSUPPORTED_EMBED = 'UNSUPPORTED_EMBED';
export const BAD_API_RESPONSE = 'BAD_API_RESPONSE';

/**
 * Returns an action object to signal that a thumbnailUrl has been received.
 *
 * @param {string} embedUrl the url of the embed for which the thumbnail was grabbed
 * @param {string} thumbnailUrl the url at which to find the thumbnail for the embed
 * @returns {object} Action object
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
 * @param  {string} embedUrl -  the url of the embed for which to get the thumbnail
 * @returns {Function|object} Action thunk | Action object
 */
export const requestThumbnail = ( embedUrl ) => ( dispatch ) => {
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
			return globalThis.fetch( fetchUrl ).then(
				async ( response ) => {
					let json;
					try {
						json = await response.json();
					} catch ( error ) {
						dispatch( requestFailure( embedUrl, error ) );
					}

					const thumbnailUrl = get( json, [ 0, 'thumbnail_large' ] );
					if ( thumbnailUrl ) {
						dispatch( requestSuccessful( embedUrl ) );
						dispatch( receiveThumbnail( embedUrl, thumbnailUrl ) );
					} else {
						dispatch(
							requestFailure( embedUrl, {
								type: BAD_API_RESPONSE,
								response: {
									status: response.status,
									ok: response.ok,
									body: json,
								},
							} )
						);
					}
				},
				( error ) => {
					dispatch( requestFailure( embedUrl, error ) );
				}
			);
		}
		default:
			dispatch( requestFailure( embedUrl, { type: UNSUPPORTED_EMBED } ) );
			return Promise.resolve();
	}
};
