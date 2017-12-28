/** @format */
/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import wpcom from 'client/lib/wp';
import {
	READER_TAG_IMAGES_REQUEST,
	READER_TAG_IMAGES_REQUEST_SUCCESS,
	READER_TAG_IMAGES_REQUEST_FAILURE,
	READER_TAG_IMAGES_RECEIVE,
} from 'client/state/action-types';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:redux:reader-tags-images' );

/**
 * Returns an action object to signal that image objects have been received.
 *
 * @param {String} tag The tag slug the images are for
 * @param  {Array}  images Images received
 * @return {Object} Action object
 */
export function receiveTagImages( tag, images ) {
	return {
		type: READER_TAG_IMAGES_RECEIVE,
		tag,
		images,
	};
}

/**
 * Triggers a network request to fetch tag images.
 *
 * @param  {Integer} tag Tag name
 * @param  {Integer} limit Maximum number of results to return
 * @return {Function} Action thunk
 */
export function requestTagImages( tag, limit = 5 ) {
	return dispatch => {
		dispatch( {
			type: READER_TAG_IMAGES_REQUEST,
			tag,
		} );

		const query = {
			tag,
			number: limit,
		};

		debug( `Requesting tag images for tag ${ tag }` );

		return wpcom
			.undocumented()
			.readTagImages( query )
			.then(
				data => {
					dispatch( receiveTagImages( tag, ( data && data.images ) || [] ) );

					dispatch( {
						type: READER_TAG_IMAGES_REQUEST_SUCCESS,
						tag,
						data,
					} );
				},
				error => {
					// dispatch an empty array so we stop requesting it
					dispatch( receiveTagImages( tag, [] ) );

					dispatch( {
						type: READER_TAG_IMAGES_REQUEST_FAILURE,
						tag,
						error,
					} );
				}
			);
	};
}
