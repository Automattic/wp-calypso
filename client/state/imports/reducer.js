/** @format */
/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import uploadsReducer from 'state/imports/uploads/reducer';
import siteImporterReducer from 'state/imports/site-importer/reducer';

export default combineReducers( {
	uploads: uploadsReducer,
	siteImporter: siteImporterReducer,
} );
