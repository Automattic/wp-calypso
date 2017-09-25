/** @format */
/**
 * External dependencies
 */
import { isArray } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { READER_SITE_REQUEST, READER_SITE_REQUEST_SUCCESS, READER_SITE_REQUEST_FAILURE, READER_SITE_UPDATE } from 'state/action-types';

export function requestSite( siteId ) {
	return function( dispatch ) {
		dispatch( {
			type: READER_SITE_REQUEST,
			payload: {
				ID: siteId,
			},
		} );
		return wpcom
			.undocumented()
			.readSite( {
				site: siteId,
				fields: [
					'ID',
					'name',
					'title',
					'URL',
					'icon',
					'is_jetpack',
					'description',
					'is_private',
					'feed_ID',
					'feed_URL',
					'capabilities',
					'prefer_feed',
					'options', // have to include this to get options at all
				].join( ',' ),
				options: [ 'is_mapped_domain', 'unmapped_url', 'is_redirect' ].join( ',' ),
			} )
			.then(
				function success( data ) {
					dispatch( {
						type: READER_SITE_REQUEST_SUCCESS,
						payload: data,
					} );
					return data;
				},
				function failure( err ) {
					dispatch( {
						type: READER_SITE_REQUEST_FAILURE,
						payload: {
							ID: siteId,
						},
						error: err,
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
		payload: sites,
	};
}
