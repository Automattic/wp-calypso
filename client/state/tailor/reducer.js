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
	previousCustomizations: [],
	customizations: {},
	activeControl: null,
	isSaved: true,
};

export default function( newState = initialState, action ) {
	const state = assign( {}, initialState, newState );
	switch ( action.type ) {
		case ActionTypes.TAILOR_MARKUP_RECEIVE:
			return assign( {}, state, { previewMarkup: action.markup } );
		case ActionTypes.TAILOR_CUSTOMIZATIONS_CLEAR:
			return assign( {}, state, { isSaved: true, customizations: {} } );
		case ActionTypes.TAILOR_CUSTOMIZATIONS_UPDATE:
			return assign( {}, state, {
				isSaved: false,
				previousCustomizations: state.previousCustomizations.concat( state.customizations ),
				customizations: assign( {}, state.customizations, action.customizations )
			} );
		case ActionTypes.TAILOR_CUSTOMIZATIONS_UNDO:
			const undoneCustomizations = state.previousCustomizations.length > 0 ? state.previousCustomizations.slice( -1 )[0] : {};
			return assign( {}, state, {
				isSaved: false,
				activeControl: null,
				previousCustomizations: state.previousCustomizations.slice( 0, -1 ),
				customizations: undoneCustomizations,
			} );
		case ActionTypes.TAILOR_CONTROL_ENTER:
			return assign( {}, state, { activeControl: action.controlId } );
		case ActionTypes.TAILOR_CONTROL_LEAVE:
			return assign( {}, state, { activeControl: null } );
		case ActionTypes.TAILOR_CUSTOMIZATIONS_SAVED:
			return assign( {}, state, { isSaved: true } );
		case ActionTypes.TAILOR_RESET:
			return assign( {}, state, { previousCustomizations: [], customizations: {}, activeControl: null, isSaved: true } );
	}
	return state;
}
