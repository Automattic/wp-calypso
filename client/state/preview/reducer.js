/** @format */

/**
 * Internal dependencies
 */

import {
	PREVIEW_MARKUP_RECEIVE,
	PREVIEW_CUSTOMIZATIONS_CLEAR,
	PREVIEW_CUSTOMIZATIONS_UPDATE,
	PREVIEW_CUSTOMIZATIONS_UNDO,
	PREVIEW_CUSTOMIZATIONS_SAVED,
} from 'state/action-types';
import { previewSchema } from './schema';

const siteInitialState = {
	previousCustomizations: [],
	customizations: {},
	isUnsaved: false,
	previewMarkup: '',
};

function siteReducer( newState = siteInitialState, action ) {
	const state = Object.assign( {}, siteInitialState, newState );
	switch ( action.type ) {
		case PREVIEW_MARKUP_RECEIVE:
			if ( action.markup === state.previewMarkup ) {
				return state;
			}
			return Object.assign( {}, state, { previewMarkup: action.markup } );
		case PREVIEW_CUSTOMIZATIONS_CLEAR:
			return Object.assign( {}, state, {
				isUnsaved: false,
				customizations: {},
				previousCustomizations: [],
			} );
		case PREVIEW_CUSTOMIZATIONS_UPDATE:
			return Object.assign( {}, state, {
				isUnsaved: true,
				previousCustomizations: state.previousCustomizations.concat( state.customizations ),
				customizations: Object.assign( {}, state.customizations, action.customizations ),
			} );
		case PREVIEW_CUSTOMIZATIONS_UNDO:
			const undoneCustomizations =
				state.previousCustomizations.length > 0
					? state.previousCustomizations.slice( -1 )[ 0 ]
					: {};
			return Object.assign( {}, state, {
				isUnsaved: true,
				previousCustomizations: state.previousCustomizations.slice( 0, -1 ),
				customizations: undoneCustomizations,
			} );
		case PREVIEW_CUSTOMIZATIONS_SAVED:
			return Object.assign( {}, state, { isUnsaved: false } );
	}
	return state;
}

const preview = function( state = {}, action ) {
	switch ( action.type ) {
		case PREVIEW_MARKUP_RECEIVE:
		case PREVIEW_CUSTOMIZATIONS_CLEAR:
		case PREVIEW_CUSTOMIZATIONS_UPDATE:
		case PREVIEW_CUSTOMIZATIONS_UNDO:
		case PREVIEW_CUSTOMIZATIONS_SAVED:
			return Object.assign( {}, state, {
				[ action.siteId ]: siteReducer( state[ action.siteId ], action ),
			} );
	}
	return state;
};
preview.schema = previewSchema;

export default preview;
