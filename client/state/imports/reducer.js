/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import uploadsReducer from 'calypso/state/imports/uploads/reducer';
import siteImporterReducer from 'calypso/state/imports/site-importer/reducer';

const combinedReducer = combineReducers( {
	uploads: uploadsReducer,
	siteImporter: siteImporterReducer,
} );

export default withStorageKey( 'imports', combinedReducer );
