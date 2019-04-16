/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import uploadsReducer from 'state/imports/uploads/reducer';
import { IMPORTS_FETCH_COMPLETED, SELECTED_SITE_SET } from 'state/action-types';

// @TODO better name than serverData
const serverData = createReducer( null, {
	[ SELECTED_SITE_SET ]: () => null,
	[ IMPORTS_FETCH_COMPLETED ]: (
		state,
		{ customData, importId, importStatus, progress, siteId, type }
	) => ( {
		customData,
		importId,
		importStatus,
		progress,
		siteId,
		type,
	} ),
} );

export default combineReducers( {
	serverData,
	uploads: uploadsReducer,
} );
