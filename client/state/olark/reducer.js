/**
 * External dependencies
 */
import isEqual from 'lodash/lang/isEqual';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import {
	OLARK_DETAILS,
	OLARK_LOCALE,
	OLARK_OPERATORS_AVAILABLE,
	OLARK_OPERATORS_AWAY,
	OLARK_READY,
	OLARK_SET_EXPANDED,
	OLARK_USER_ELIGIBILITY
} from 'state/action-types';

/**
 * Module variables
 */
const initialState = Immutable.fromJS( {
	isOperatorAvailable: false,
	isOlarkReady: false,
	isUserEligible: false,
	isOlarkExpanded: false,
	locale: 'en',
	details: {}
} );

export default function( state = initialState, action ) {
	var newState = state;

	switch ( action.type ) {
		case OLARK_USER_ELIGIBILITY:
			newState = state.set( 'isUserEligible', action.isUserEligible );
			break;
		case OLARK_LOCALE:
			newState = state.set( 'locale', action.locale );
			break;
		case OLARK_READY:
			newState = state.set( 'isOlarkReady', true );
			break;
		case OLARK_OPERATORS_AWAY:
			newState = state.set( 'isOperatorAvailable', false );
			break;
		case OLARK_OPERATORS_AVAILABLE:
			newState = state.set( 'isOperatorAvailable', true );
			break;
		case OLARK_SET_EXPANDED:
			newState = state.set( 'isOlarkExpanded', action.isOlarkExpanded );
			break;
		case OLARK_DETAILS:
			newState = state.set( 'details', action.details );
			break;
	}

	return Immutable.is( newState, state ) ? state : newState;
};
