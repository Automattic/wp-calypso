import get from 'lodash/get';
import omit from 'lodash/omit';
import isArray from 'lodash/isArray';

import wpcom from 'lib/wp';

import {
	READER_SITE_REQUEST,
	READER_SITE_REQUEST_SUCCESS,
	READER_SITE_REQUEST_FAILURE,
	READER_FEED_UPDATE,
	READER_SITE_UPDATE
} from 'state/action-types';

export function requestSite( siteId ) {
	return function( dispatch ) {
		dispatch( {
			type: READER_SITE_REQUEST,
			payload: {
				ID: siteId
			}
		} );
		return wpcom.undocumented().readSite( { site: siteId, meta: 'feed' } ).then(
			function success( data ) {
				dispatch( {
					type: READER_SITE_REQUEST_SUCCESS,
					payload: omit( data, '_headers' )
				} );
				const feedInfo = get( data, 'meta.data.feed' );
				if ( feedInfo ) {
					dispatch( {
						type: READER_FEED_UPDATE,
						payload: feedInfo
					} );
				}
				return data;
			},
			function failure( err ) {
				dispatch( {
					type: READER_SITE_REQUEST_FAILURE,
					payload: {
						ID: siteId
					},
					error: err
				} );
				throw err;
			}
		);
	};
}

export function updateSites( sites ) {
	if ( ! isArray( sites ) ) {
		sites = [ sites ];
	}
	return {
		type: READER_SITE_UPDATE,
		payload: sites
	};
}
