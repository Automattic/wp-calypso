import debugModule from 'debug';
import getEmbedMetadata from 'get-video-id';
import { get } from 'lodash';
import { READER_THUMBNAIL_RECEIVE } from 'calypso/state/reader/action-types';

import 'calypso/state/reader/init';

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
 * @returns {Object} Action object
 */
export function receiveThumbnail( embedUrl, thumbnailUrl ) {
	return {
		type: READER_THUMBNAIL_RECEIVE,
		embedUrl,
		thumbnailUrl,
	};
}

/**
 * Either instantly returns an action for the thumbnail info or
 * triggers a network request to fetch a thumbnailUrl if necessary
 *
 * @param  {string} embedUrl -  the url of the embed for which to get the thumbnail
 * @returns {Function | Object} Action thunk | Action object
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
			const posterEndpoint = `https://public-api.wordpress.com/rest/v1.1/videos/${ id }/poster`;

			return globalThis.fetch( posterEndpoint ).then( async ( response ) => {
				let json;
				try {
					json = await response.json();
				} catch ( error ) {}

				const thumbnailUrl = json?.poster ?? '';
				if ( thumbnailUrl ) {
					dispatch( receiveThumbnail( embedUrl, thumbnailUrl ) );
				}
			} );
		}
		case 'vimeo': {
			debug( `Requesting thumbnail for embed ${ embedUrl }` );

			const fetchUrl = `https://vimeo.com/api/v2/video/${ id }.json`;
			return globalThis.fetch( fetchUrl ).then( async ( response ) => {
				let json;
				try {
					json = await response.json();
				} catch ( error ) {}

				const thumbnailUrl = get( json, [ 0, 'thumbnail_large' ] );
				if ( thumbnailUrl ) {
					dispatch( receiveThumbnail( embedUrl, thumbnailUrl ) );
				}
			} );
		}
		default:
			return Promise.resolve();
	}
};
