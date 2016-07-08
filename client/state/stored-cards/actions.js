// External dependencies
import i18n from 'i18n-calypso';
import { omit, values } from 'lodash';

// Internal dependencies
import {
	STORED_CARDS_DELETE,
	STORED_CARDS_DELETE_COMPLETED,
	STORED_CARDS_DELETE_FAILED,
	STORED_CARDS_FETCH,
	STORED_CARDS_FETCH_COMPLETED,
	STORED_CARDS_FETCH_FAILED
} from 'state/action-types';
import wp from 'lib/wp';
const wpcom = wp.undocumented();

/**
 * `wpcom` assigns a `_headers` property to the response, even if the response
 * is an array. This function omits the `_headers` property and converts the
 * response to a real array, instead of an object keyed with indices.
 *
 * @param {Object} response - The response to a request from `wpcom`.
 * @return {array} response - The given response converted into an array.
 */
const getArrayFromResponse = response => values( omit( response, '_headers' ) );

export const fetchStoredCards = () => dispatch => {
	dispatch( {
		type: STORED_CARDS_FETCH
	} );

	return new Promise( ( resolve, reject ) => {
		wpcom.getStoredCards( ( error, data ) => {
			error ? reject( error ) : resolve( data );
		} );
	} ).then( data => {
		dispatch( {
			type: STORED_CARDS_FETCH_COMPLETED,
			list: getArrayFromResponse( data )
		} );
	} ).catch( error => {
		dispatch( {
			type: STORED_CARDS_FETCH_FAILED,
			error: error.message || i18n.translate( 'There was a problem retrieving stored cards.' )
		} );
	} );
};

export const deleteStoredCard = card => dispatch => {
	dispatch( {
		type: STORED_CARDS_DELETE
	} );

	return new Promise( ( resolve, reject ) => {
		wpcom.me().storedCardDelete( card, ( error, data ) => {
			error ? reject( error ) : resolve( data );
		} );
	} ).then( () => {
		dispatch( {
			type: STORED_CARDS_DELETE_COMPLETED,
			card
		} );
	} ).catch( error => {
		dispatch( {
			type: STORED_CARDS_DELETE_FAILED,
			error: error.message || i18n.translate( 'There was a problem deleting the stored card.' )
		} );
	} );
};
