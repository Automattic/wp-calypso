/**
 * Internal dependencies
 */
import { combineReducersWithPersistence, createReducer } from 'state/utils';

import { MEDIA_MODAL_VIEW_SET } from 'state/action-types';

export const view = createReducer( null, {
	[ MEDIA_MODAL_VIEW_SET ]: ( state, action ) => action.view
} );

export default combineReducersWithPersistence( {
	view
} );
