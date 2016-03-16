/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_LISTS_REQUEST_SUCCESS,
	READER_LISTS_REQUEST_FAILURE
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that list objects have
 * been received.
 *
 * @param  {Array}  lists Lists received
 * @return {Object}       Action object
 */
export function receiveLists( lists ) {
	return {
		type: READER_LISTS_RECEIVE,
		lists
	};
}

/**
 * Triggers a network request to fetch the current user's lists.
 *
 * @return {Function}        Action thunk
 */
export function requestSubscribedLists() {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LISTS_REQUEST,
		} );

		return wpcom.undocumented().readLists().then( data => {
			dispatch( receiveLists( data.lists ) );
			dispatch( {
				type: READER_LISTS_REQUEST_SUCCESS,
				lists: data.lists
			} );
		}, ( error ) => {
			dispatch( {
				type: READER_LISTS_REQUEST_FAILURE,
				error
			} );
		} );
	};
}
