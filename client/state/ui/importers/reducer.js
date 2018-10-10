/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { IMPORTS_IMPORTER_OPTION_SELECT } from 'state/action-types';

export const importerOption = createReducer( null, {
	[ IMPORTS_IMPORTER_OPTION_SELECT ]: ( state, action ) => action.importerOption,
} );

export default combineReducers( { importerOption } );
