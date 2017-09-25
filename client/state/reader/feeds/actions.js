/** @format */
/**
 * External dependencies
 */
import { isArray } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { READER_FEED_REQUEST, READER_FEED_REQUEST_SUCCESS, READER_FEED_REQUEST_FAILURE, READER_FEED_UPDATE } from 'state/action-types';

export function requestFeed( feedId ) {
	return function( dispatch ) {
		dispatch( {
			type: READER_FEED_REQUEST,
			payload: {
				feed_ID: feedId,
			},
		} );
		return wpcom
			.undocumented()
			.readFeed( { ID: feedId } )
			.then(
				function success( data ) {
					dispatch( {
						type: READER_FEED_REQUEST_SUCCESS,
						payload: data,
					} );
					return data;
				},
				function failure( err ) {
					dispatch( {
						type: READER_FEED_REQUEST_FAILURE,
						payload: {
							feed_ID: feedId,
						},
						error: err,
					} );
					throw err;
				}
			);
	};
}

export function updateFeeds( feeds ) {
	if ( ! isArray( feeds ) ) {
		feeds = [ feeds ];
	}
	return {
		type: READER_FEED_UPDATE,
		payload: feeds,
	};
}
