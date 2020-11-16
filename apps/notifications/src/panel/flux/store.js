/**
 * External dependencies
 */
import events from 'events';
const eventEmitter = new events.EventEmitter();

/**
 * Internal dependencies
 */
import { actions } from './constants';

/**
 * Module variables
 */
const initialState = {};
let state = { ...initialState };

function emitChange() {
	eventEmitter.emit( 'change' );
}

function reduce( state, action ) {
	let newState;

	switch ( action.type ) {
		case actions.SET_GLOBAL_DATA:
			newState = {
				...state,
				global: action.data,
			};
			break;

		default:
			newState = state;
			break;
	}

	return newState;
}

const store = {
	dispatch( action ) {
		const oldState = state;

		state = reduce( state, action );

		if ( oldState !== state ) {
			emitChange();
		}
	},

	get( item ) {
		if ( item ) {
			return state[ item ];
		}

		return state;
	},
};

export default store;
