/**
 * Internal dependencies
 */
import { STATUS_UNINITIALIZED, STATUS_INITIALIZING, STATUS_READY, STATUS_ERROR } from './constants';
import { DIRECTLY_ASK_QUESTION, DIRECTLY_INITIALIZATION_START, DIRECTLY_INITIALIZATION_SUCCESS, DIRECTLY_INITIALIZATION_ERROR } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

export const questionAsked = ( state = null, action ) => {
	switch ( action.type ) {
		case DIRECTLY_ASK_QUESTION:
			const { questionText, name, email } = action;
			return { questionText, name, email };
	}

	return state;
};

export const status = createReducer( STATUS_UNINITIALIZED, {
	[ DIRECTLY_INITIALIZATION_START ]: () => STATUS_INITIALIZING,
	[ DIRECTLY_INITIALIZATION_SUCCESS ]: () => STATUS_READY,
	[ DIRECTLY_INITIALIZATION_ERROR ]: () => STATUS_ERROR,
} );

export default combineReducers( {
	questionAsked,
	status,
} );
