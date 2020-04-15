/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	POST_FORMATS_RECEIVE,
	POST_FORMATS_REQUEST,
	POST_FORMATS_REQUEST_SUCCESS,
	POST_FORMATS_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve post formats for a site.
 *
 * @param  {number}   siteId Site ID
 * @returns {Function}        Action thunk
 */
export function requestPostFormats( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: POST_FORMATS_REQUEST,
			siteId,
		} );

		return wpcom
			.undocumented()
			.site( siteId )
			.postFormatsList()
			.then( ( { formats } ) => {
				dispatch( {
					type: POST_FORMATS_RECEIVE,
					siteId,
					formats,
				} );

				dispatch( {
					type: POST_FORMATS_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: POST_FORMATS_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}
