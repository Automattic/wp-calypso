/**
 * External dependencies
 */
import React from 'react/addons';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/upgrades/constants';
import { createStoredCardsArray } from './assembler.js';

function updateState( state, data ) {
	return React.addons.update( state, {
		$merge: data
	} );
}

function deleteCard( state, card ) {
	return React.addons.update( state, {
		isDeleting: { $set: false },
		list: {
			$apply: list => list.filter( item => item.id !== card.id )
		}
	} );

}

function getInitialState() {
	return {
		isDeleting: false,
		isFetching: false,
		list: []
	};
}

const reducer = ( state, payload ) => {
	const { action } = payload;

	switch ( action.type ) {
		case ActionTypes.STORED_CARDS_FETCH:
			state = updateState( state, {
				isFetching: true
			} );

			break;

		case ActionTypes.STORED_CARDS_FETCH_COMPLETED:
			state = updateState( state, {
				isFetching: false,
				list: createStoredCardsArray( action.list )
			} );

			break;

		case ActionTypes.STORED_CARDS_FETCH_FAILED:
			state = updateState( state, {
				isFetching: false
			} );

			break;

		case ActionTypes.STORED_CARDS_DELETE:
			state = updateState( state, {
				isDeleting: true
			} );

			break;

		case ActionTypes.STORED_CARDS_DELETE_COMPLETED:
			state = deleteCard( state, action.card );

			break;

		case ActionTypes.STORED_CARDS_DELETE_FAILED:
			state = updateState( state, {
				isDeleting: false
			} );

			break;
	}

	return state;
};

export {
	getInitialState,
	reducer
};
