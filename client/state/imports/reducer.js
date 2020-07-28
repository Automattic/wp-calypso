/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'state/utils';
import uploadsReducer from 'state/imports/uploads/reducer';
import siteImporterReducer from 'state/imports/site-importer/reducer';

const combinedReducer = combineReducers( {
	uploads: uploadsReducer,
	siteImporter: siteImporterReducer,
} );

export default withStorageKey( 'imports', combinedReducer );
