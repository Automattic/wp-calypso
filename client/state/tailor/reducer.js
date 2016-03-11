/**
 * External dependencies
 */
import assign from 'lodash/assign';

/**
 * Internal dependencies
 */
import * as ActionTypes from 'state/action-types';

const initialState = {
	previewMarkup: '',
	customizations: {},
	activeControl: null,
	isSaved: true,
};

export default function( state = initialState, action ) {
	switch ( action.type ) {
		case ActionTypes.TAILOR_MARKUP_RECEIVE:
			return assign( {}, state, { previewMarkup: action.markup } );
		case ActionTypes.TAILOR_CUSTOMIZATIONS_CLEAR:
			return assign( {}, state, { isSaved: true, customizations: {} } );
		case ActionTypes.TAILOR_CUSTOMIZATIONS_UPDATE:
			return assign( {}, state, { isSaved: false, customizations: assign( {}, state.customizations, action.customizations ) } );
		case ActionTypes.TAILOR_CONTROL_ENTER:
			return assign( {}, state, { activeControl: action.controlId } );
		case ActionTypes.TAILOR_CONTROL_LEAVE:
			return assign( {}, state, { activeControl: null } );
		case ActionTypes.TAILOR_CUSTOMIZATIONS_SAVED:
			return assign( {}, state, { isSaved: true } );
	}
	return state;
}
