/**
 * Internal dependencies
 */
import * as ActionTypes from 'state/action-types';
import { previewSchema } from './schema';
import { isValidStateWithSchema } from 'state/utils';

const initialState = {};

const siteInitialState = {
	previousCustomizations: [],
	customizations: {},
	isUnsaved: false,
	previewMarkup: '',
};

function siteReducer( newState = siteInitialState, action ) {
	const state = Object.assign( {}, siteInitialState, newState );
	switch ( action.type ) {
		case ActionTypes.PREVIEW_MARKUP_RECEIVE:
			if ( action.markup === state.previewMarkup ) {
				return state;
			}
			return Object.assign( {}, state, {
				lastError: null,
				previewMarkup: action.markup,
			} );
		case ActionTypes.PREVIEW_MARKUP_RECEIVE_FAILURE:
			return Object.assign( {}, state, {
				lastError: action.error,
				previewMarkup: null,
			} );
		case ActionTypes.PREVIEW_CUSTOMIZATIONS_CLEAR:
			return Object.assign( {}, state, { isUnsaved: false, customizations: {}, previousCustomizations: [] } );
		case ActionTypes.PREVIEW_CUSTOMIZATIONS_UPDATE:
			return Object.assign( {}, state, {
				isUnsaved: true,
				previousCustomizations: state.previousCustomizations.concat( state.customizations ),
				customizations: Object.assign( {}, state.customizations, action.customizations )
			} );
		case ActionTypes.PREVIEW_CUSTOMIZATIONS_UNDO:
			const undoneCustomizations = state.previousCustomizations.length > 0 ? state.previousCustomizations.slice( -1 )[0] : {};
			return Object.assign( {}, state, {
				isUnsaved: true,
				previousCustomizations: state.previousCustomizations.slice( 0, -1 ),
				customizations: undoneCustomizations,
			} );
		case ActionTypes.PREVIEW_CUSTOMIZATIONS_SAVED:
			return Object.assign( {}, state, { isUnsaved: false } );
	}
	return state;
}

export default function( newState = initialState, action ) {
	const state = Object.assign( {}, initialState, newState );
	switch ( action.type ) {
		case ActionTypes.PREVIEW_MARKUP_RECEIVE:
		case ActionTypes.PREVIEW_MARKUP_RECEIVE_FAILURE:
		case ActionTypes.PREVIEW_CUSTOMIZATIONS_CLEAR:
		case ActionTypes.PREVIEW_CUSTOMIZATIONS_UPDATE:
		case ActionTypes.PREVIEW_CUSTOMIZATIONS_UNDO:
		case ActionTypes.PREVIEW_CUSTOMIZATIONS_SAVED:
			const siteState = siteReducer( state[ action.siteId ], action );
			const hasChanged = siteState !== state[ action.siteId ];
			return hasChanged
				? Object.assign( {}, state, { [ action.siteId ]: siteState } )
				: state;
		case ActionTypes.SERIALIZE:
			return state;
		case ActionTypes.DESERIALIZE:
			if ( isValidStateWithSchema( state, previewSchema ) ) {
				return state;
			}
			return initialState;
	}
	return state;
}
