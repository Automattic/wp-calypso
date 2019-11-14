/**
 * Internal dependencies
 */

import { combineReducers, withoutPersistence } from 'state/utils';
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZATION_START,
	DIRECTLY_INITIALIZATION_SUCCESS,
	DIRECTLY_INITIALIZATION_ERROR,
} from 'state/action-types';
import { STATUS_UNINITIALIZED, STATUS_INITIALIZING, STATUS_READY, STATUS_ERROR } from './constants';

export const questionAsked = ( state = null, action ) => {
	switch ( action.type ) {
		case DIRECTLY_ASK_QUESTION: {
			const { questionText, name, email } = action;
			return { questionText, name, email };
		}
	}

	return state;
};

export const status = withoutPersistence( ( state = STATUS_UNINITIALIZED, action ) => {
	switch ( action.type ) {
		case DIRECTLY_INITIALIZATION_START:
			return STATUS_INITIALIZING;
		case DIRECTLY_INITIALIZATION_SUCCESS:
			return STATUS_READY;
		case DIRECTLY_INITIALIZATION_ERROR:
			return STATUS_ERROR;
	}

	return state;
} );

export default combineReducers( {
	questionAsked,
	status,
} );
