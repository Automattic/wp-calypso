/**
 * External dependencies
 */
import includes from 'lodash/includes';
import takeRight from 'lodash/takeRight';
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	ACTION_LOG_RECEIVE,
	ACTION_LOG_RESET,
	DESERIALIZE,
	GUIDED_TOUR_SHOW,
	GUIDED_TOUR_UPDATE,
	SERIALIZE,
	SET_ROUTE,
	THEMES_RECEIVE,
	PREVIEW_IS_SHOWING,
} from 'state/action-types';

const permanentActions = [
	GUIDED_TOUR_UPDATE,
];

const temporaryActions = [
	SET_ROUTE,
	GUIDED_TOUR_SHOW,
	GUIDED_TOUR_UPDATE,
	THEMES_RECEIVE,
	PREVIEW_IS_SHOWING,
];

const isPermanentAction = ( action ) =>
	includes( permanentActions, action.type ) &&
	action.shouldShow === false;

const isTemporaryAction = ( action ) =>
	includes( temporaryActions, action.type );

const newAction = ( action ) => ( {
	...action, timestamp: Date.now()
} );

const permanent = ( state = [], action ) => {
	// Receive arbitrary collection
	if ( action.type === ACTION_LOG_RECEIVE ) {
		return [ ...state, ...action.actions.map( newAction ) ];
	}

	// Reset arbitrarily, for testing
	if ( action.type === ACTION_LOG_RESET ) {
		return [];
	}

	// Log some actions as we go, persist with localForage
	return isPermanentAction( action )
		? [ ...state, newAction( action ) ]
		: state;
};

const temporary = ( state = [], action ) =>
	isTemporaryAction( action )
		? takeRight( [ ...state, newAction( action ) ], 50 )
		: state;

const actionLog = combineReducers( {
	permanent,
	temporary,
} );

export default function( state, action ) {
	if ( includes( [ SERIALIZE, DESERIALIZE ], action.type ) ) {
		return {
			permanent: state.permanent,
			temporary: [],
		};
	}

	return actionLog( state, action );
}
