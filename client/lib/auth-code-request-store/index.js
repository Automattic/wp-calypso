import { createReducerStore } from 'lib/store'
import { actions as ActionTypes } from './constants'
import keyMirror from 'key-mirror';

export const requestState = keyMirror( {
	READY: null,
	REQUESTING: null,
	COMPLETE: null
} )

const initialState = {
	// API request status
	status: requestState.READY,
	// there was an error fulfillinng the request
	errorLevel: false,
	errorMessage: false
}

// If we receive an error that's not a needs_2fa then update state to reflect the error
// If the error was a needs_2fa from the API that means we successfully asked for an SMS
function handleSMSResponse( payload ) {
	const { data, error } = payload;
	var errorMessage = null;

	// if it's 2fa error then we actually successfully requested an sms code
	if ( data && data.body && data.body.error === 'needs_2fa' ) {
		return Object.assign( {}, initialState, { status: requestState.COMPLETE } );
	}

	// assign the error message from the response body, otherwise take it from the error object
	if ( data && data.body && data.body.error_description ) {
		errorMessage = data.body.error_description;
	} else if ( error ) {
		errorMessage = error.message;
	}

	return Object.assign( {}, initialState, {
		status: requestState.COMPLETE,
		errorLevel: 'is-error',
		errorMessage
	} );
}

export default createReducerStore( function( state, payload ) {
	const { action } = payload;

	switch ( action.type ) {
		case ActionTypes.AUTH_CODE_REQUEST:
			return { status: requestState.REQUESTING, errorLevel: false, errorMessage: false }
		case ActionTypes.RECEIVE_AUTH_CODE_REQUEST:
			return handleSMSResponse( action );
		case ActionTypes.RESET_AUTH_CODE_REQUEST:
			return initialState;
	}

	return state;
}, initialState );
