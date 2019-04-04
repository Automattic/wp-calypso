/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer, combineReducers } from 'state/utils';
import {
	SITE_IMPORTER_IMPORT_START,
	SITE_IMPORTER_IMPORT_SUCCESS,
	SITE_IMPORTER_IMPORT_FAILURE,
	SITE_IMPORTER_IMPORT_RESET,
	SITE_IMPORTER_VALIDATION_ERROR_SET,
	SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_START,
	SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_SUCCESS,
	SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_FAILURE,
} from './action-types';

const DEFAULT_ERROR_STATE = {
	error: false,
	errorMessage: '',
	errorType: null,
};
const DEFAULT_IMPORT_STAGE = 'idle';
const DEFAULT_IMPORT_DATA = {};

const isLoading = createReducer( false, {
	[ SITE_IMPORTER_IMPORT_FAILURE ]: () => false,
	[ SITE_IMPORTER_IMPORT_START ]: () => true,
	[ SITE_IMPORTER_IMPORT_SUCCESS ]: () => false,
	[ SITE_IMPORTER_IMPORT_RESET ]: () => false,
	[ SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_FAILURE ]: () => false,
	[ SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_START ]: () => true,
	[ SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_SUCCESS ]: () => false,
} );

const error = createReducer( DEFAULT_ERROR_STATE, {
	[ SITE_IMPORTER_IMPORT_SUCCESS ]: () => DEFAULT_ERROR_STATE,
	[ SITE_IMPORTER_IMPORT_FAILURE ]: ( state, { message } ) => ( {
		error: true,
		errorType: 'importError',
		errorMessage: message,
	} ),
	[ SITE_IMPORTER_IMPORT_START ]: () => DEFAULT_ERROR_STATE,

	[ SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_SUCCESS ]: () => DEFAULT_ERROR_STATE,
	[ SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_FAILURE ]: ( state, { message } ) => ( {
		error: true,
		errorType: 'importError',
		errorMessage: message,
	} ),
	[ SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_START ]: () => DEFAULT_ERROR_STATE,
	[ SITE_IMPORTER_IMPORT_RESET ]: () => DEFAULT_ERROR_STATE,
	[ SITE_IMPORTER_VALIDATION_ERROR_SET ]: ( state, { message } ) => ( {
		error: true,
		errorType: 'validationError',
		errorMessage: message,
	} ),
} );

const importStage = createReducer( DEFAULT_IMPORT_STAGE, {
	[ SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_SUCCESS ]: () => 'importable',
	[ SITE_IMPORTER_IMPORT_RESET ]: () => DEFAULT_IMPORT_STAGE,
} );

const importData = createReducer( DEFAULT_IMPORT_DATA, {
	// TODO: How should we clean this data up / reset it?
	// Looking at the original code, there's no other setState call that does so.
	[ SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_SUCCESS ]: ( state, { response } ) => ( {
		title: response.site_title,
		supported: response.supported_content,
		unsupported: response.unsupported_content,
		favicon: response.favicon,
		engine: response.engine,
		url: response.url,
	} ),
} );

const urlInputValue = createReducer( '', {
	[ SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_SUCCESS ]: ( state, { response } ) =>
		get( response, 'site_url', '' ),
	// [ SITE_IMPORTER_URL_INPUT_CHANGE ]: ( state, value ) => value,
} );

export default combineReducers( {
	isLoading,
	error,
	importStage,
	importData,
	urlInputValue,
} );
