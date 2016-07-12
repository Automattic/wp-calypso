/**
 * External dependencies
 */
import update from 'react-addons-update';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/upgrades/constants';
import { createStoredCardsArray } from './assembler.js';

function updateState( state, data ) {
	return update( state, {
		$merge: data
	} );
}

function getInitialState() {
	return {
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
	}

	return state;
};

export {
	getInitialState,
	reducer
};
