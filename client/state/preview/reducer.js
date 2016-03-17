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
	isSaved: true,
};

export default function( newState = initialState, action ) {
	const state = assign( {}, initialState, newState );
	switch ( action.type ) {
		case ActionTypes.PREVIEW_MARKUP_RECEIVE:
			return assign( {}, state, { previewMarkup: action.markup } );
		case ActionTypes.PREVIEW_CUSTOMIZATIONS_CLEAR:
			return assign( {}, state, { isSaved: true, customizations: {}, previousCustomizations: [] } );
		case ActionTypes.PREVIEW_CUSTOMIZATIONS_UPDATE:
			return assign( {}, state, {
				isSaved: false,
				previousCustomizations: state.previousCustomizations.concat( state.customizations ),
				customizations: assign( {}, state.customizations, action.customizations )
			} );
		case ActionTypes.PREVIEW_CUSTOMIZATIONS_UNDO:
			const undoneCustomizations = state.previousCustomizations.length > 0 ? state.previousCustomizations.slice( -1 )[0] : {};
			return assign( {}, state, {
				isSaved: false,
				previousCustomizations: state.previousCustomizations.slice( 0, -1 ),
				customizations: undoneCustomizations,
			} );
		case ActionTypes.PREVIEW_CUSTOMIZATIONS_SAVED:
			return assign( {}, state, { isSaved: true } );
	}
	return state;
}
