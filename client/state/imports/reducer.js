/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import uploadsReducer from 'state/imports/uploads/reducer';
import siteImporterReducer from 'state/imports/site-importer/reducer';
import { IMPORTS_FETCH_COMPLETED, SELECTED_SITE_SET } from 'state/action-types';

const isHydrated = createReducer( false, {
	[ SELECTED_SITE_SET ]: () => false,
	[ IMPORTS_FETCH_COMPLETED ]: () => true,
} );

export default combineReducers( {
	isHydrated,
	uploads: uploadsReducer,
	siteImporter: siteImporterReducer,
} );
