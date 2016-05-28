import isArray from 'lodash/isArray';
import get from 'lodash/get';
import omit from 'lodash/omit';

import wpcom from 'lib/wp';

import {
	READER_FEED_REQUEST,
	READER_FEED_REQUEST_SUCCESS,
	READER_FEED_REQUEST_FAILURE,
	READER_FEED_UPDATE,
	READER_SITE_UPDATE
} from 'state/action-types';

export function requestFeed( feedId ) {
	return function( dispatch ) {
		dispatch( {
			type: READER_FEED_REQUEST,
			payload: {
				feed_ID: feedId
			}
		} );
		return wpcom.undocumented().readFeed( { ID: feedId, meta: 'site' } ).then(
			function success( data ) {
				dispatch( {
					type: READER_FEED_REQUEST_SUCCESS,
					payload: omit( data, '_headers' )
				} );
				const siteInfo = get( data, 'meta.data.site' );
				if ( siteInfo ) {
					dispatch( {
						type: READER_SITE_UPDATE,
						payload: siteInfo
					} );
				}
				return data;
			},
			function failure( err ) {
				dispatch( {
					type: READER_FEED_REQUEST_FAILURE,
					payload: {
						feed_ID: feedId
					},
					error: err
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
		payload: feeds
	};
}
