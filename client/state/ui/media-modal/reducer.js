/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, createReducer } from 'client/state/utils';
import { MEDIA_MODAL_VIEW_SET } from 'client/state/action-types';

export const view = createReducer( null, {
	[ MEDIA_MODAL_VIEW_SET ]: ( state, action ) => action.view,
} );

export default combineReducers( {
	view,
} );
