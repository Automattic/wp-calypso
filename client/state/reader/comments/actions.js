/**
 * External dependencies
 */
import { camelCase, mapKeys } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	READER_COMMENTS_SEARCH,
	READER_COMMENTS_SEARCH_FAILURE,
	READER_COMMENTS_SEARCH_SUCCESS,
} from 'state/action-types';

const fromApi = ( data ) => {
	return mapKeys( data, ( value, key ) => camelCase( key ) );
};

export function searchComments( query ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_COMMENTS_SEARCH
		} );

		return wpcom.undocumented().getComments( query ).then( response => {
			dispatch( {
				type: READER_COMMENTS_SEARCH_SUCCESS,
				query,
				items: response.map( fromApi )
			} );

			return response;
		}, error => {
			const errorMessage = error.message || translate( 'Unable to search comments.' );

			dispatch( {
				type: READER_COMMENTS_SEARCH_FAILURE,
				error: errorMessage
			} );

			return Promise.reject( error );
		} );
	};
}
