/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import uploadsReducer from 'state/imports/uploads/reducer';
import siteImporterReducer from 'state/imports/site-importer/reducer';
import {
	IMPORTS_FETCH,
	IMPORTS_FETCH_COMPLETED,
	IMPORTS_FETCH_FAILED,
	SELECTED_SITE_SET,
} from 'state/action-types';

const isFetching = createReducer( false, {
	[ IMPORTS_FETCH ]: () => true,
	[ IMPORTS_FETCH_COMPLETED ]: () => false,
	[ IMPORTS_FETCH_FAILED ]: () => false,
	[ SELECTED_SITE_SET ]: () => false,
} );

const isHydrated = createReducer( false, {
	[ SELECTED_SITE_SET ]: () => false,
	[ IMPORTS_FETCH_COMPLETED ]: () => true,
} );

export default combineReducers( {
	isFetching,
	isHydrated,
	uploads: uploadsReducer,
	siteImporter: siteImporterReducer,
} );
