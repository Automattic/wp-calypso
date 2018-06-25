/** @format */

/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	WORDADS_EARNINGS_REQUEST,
	WORDADS_EARNINGS_REQUEST_SUCCESS,
	WORDADS_EARNINGS_REQUEST_FAILURE,
} from 'state/action-types';

export function requestWordadsEarnings( siteId ) {
	return dispatch => {
		dispatch( {
			type: WORDADS_EARNINGS_REQUEST,
			siteId,
		} );
		return wpcom
			.undocumented()
			.getWordadsEarnings( siteId )
			.then( result => {
				dispatch( {
					type: WORDADS_EARNINGS_REQUEST_SUCCESS,
					siteId,
					earnings: result.earnings,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: WORDADS_EARNINGS_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}
