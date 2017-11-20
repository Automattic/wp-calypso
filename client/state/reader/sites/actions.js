/** @format */
/**
 * External Dependencies
 */
import { isArray } from 'lodash';

/**
 * Internal Dependencies
 */
import wpcom from 'lib/wp';
import {
	READER_SITE_REQUEST,
	READER_SITE_REQUEST_SUCCESS,
	READER_SITE_REQUEST_FAILURE,
	READER_SITE_UPDATE,
} from 'state/action-types';
import { fields } from './fields';

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
				fields: fields.join( ',' ),
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
				function failure( error ) {
					dispatch( {
						type: READER_SITE_REQUEST_FAILURE,
						payload: {
							ID: siteId,
						},
						error,
					} );
					throw error;
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
