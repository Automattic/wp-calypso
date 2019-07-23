/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	RIVET_SUGGESTIONS_ERROR,
	RIVET_SUGGESTIONS_RECEIVE,
	RIVET_SUGGESTIONS_REQUEST,
} from 'state/action-types';

export function requestRivetSuggestions( service, parameters = {} ) {
	return dispatch => {
		dispatch( { type: RIVET_SUGGESTIONS_REQUEST } );
		return wpcom
			.undocumented()
			.getRivetSuggestions( service, parameters )
			.then( response => {
				dispatch( {
					type: RIVET_SUGGESTIONS_RECEIVE,
					suggestions: get( response, 'suggestions[0].list', [] ),
				} );
			} )
			.catch( error => {
				dispatch( {
					type: RIVET_SUGGESTIONS_ERROR,
					error,
				} );
			} );
	};
}
