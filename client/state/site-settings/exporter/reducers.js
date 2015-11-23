/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import Immutable from 'immutable';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import {
	TOGGLE_EXPORTER_ADVANCED_SETTINGS,
	TOGGLE_EXPORTER_SECTION
} from 'state/action-types';

const debug = debugModule( 'calypso:exporter' );

const initialUIState = Immutable.fromJS( {
	advancedSettings: {
		isVisible: false,
		posts: {
			isEnabled: true
		},
		pages: {
			isEnabled: true
		},
		feedback: {
			isEnabled: true
		}
	}
} );

/**
 * Reducer for managing the exporter UI
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function ui( state = initialUIState, action ) {
	switch ( action.type ) {
		case TOGGLE_EXPORTER_SECTION:
			return state.updateIn( [ 'advancedSettings', action.section, 'isEnabled' ], ( x ) => ( !x ) );
		case TOGGLE_EXPORTER_ADVANCED_SETTINGS:
			return state.updateIn( [ 'advancedSettings', 'isVisible' ], ( x ) => ( !x ) );
	}

	return state;
}

export default combineReducers( {
	ui
} );
