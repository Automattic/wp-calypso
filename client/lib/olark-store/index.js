/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/olark-store/constants';
import { createReducerStore } from 'lib/store';

/**
 * Module variables
 */
const initialState = {
	isOperatorAvailable: false,
	isOlarkReady: false,
	isUserEligible: false,
	isOlarkExpanded: false,
	isSupportClosed: false,
	locale: 'en',
	details: {}
};

const olarkStore = createReducerStore( function( state, payload ) {
	let stateChanges;
	const { action } = payload;

	switch ( action.type ) {
		case ActionTypes.OLARK_USER_ELIGIBILITY:
			stateChanges = { isUserEligible: action.isUserEligible };
			break;
		case ActionTypes.OLARK_LOCALE:
			stateChanges = { locale: action.locale };
			break;
		case ActionTypes.OLARK_READY:
			stateChanges = { isOlarkReady: true };
			break;
		case ActionTypes.OLARK_OPERATORS_AWAY:
			stateChanges = { isOperatorAvailable: false };
			break;
		case ActionTypes.OLARK_OPERATORS_AVAILABLE:
			stateChanges = { isOperatorAvailable: true };
			break;
		case ActionTypes.OLARK_SET_EXPANDED:
			stateChanges = { isOlarkExpanded: action.isOlarkExpanded };
			break;
		case ActionTypes.OLARK_DETAILS:
			stateChanges = { details: action.details };
			break;
		case ActionTypes.OLARK_SET_CLOSED:
			stateChanges = { isSupportClosed: action.isSupportClosed };
			break;
	}

	if ( stateChanges ) {
		return Object.assign( {}, state, stateChanges );
	}

	return state;
}, initialState );

export default olarkStore;
