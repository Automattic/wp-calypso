/**
 * External dependencies
 */
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import { actionTypes } from './constants';
import { createReducerStore } from 'lib/store';

/**
 * Module variables
 */
const initialState = {
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
};
const toggle = ( x ) => !x;

const ImporterStore = createReducerStore( function( state, payload ) {
	let { action } = payload,
		newState;

	switch ( action.type ) {
		case actionTypes.TOGGLE_ADVANCED_SETTINGS:
			newState = state.updateIn( [ 'advancedSettings', 'isVisible' ], toggle );
			break;

		case actionTypes.TOGGLE_SECTION:
			newState = state.updateIn(
				[ 'advancedSettings', action.section, 'isEnabled' ],
				toggle
			);
			break;

		default:
			newState = state;
			break;
	}

	return newState;
}, Immutable.fromJS( initialState ) );

export function getState() {
	return ImporterStore.get().toJS();
}

export default ImporterStore;
