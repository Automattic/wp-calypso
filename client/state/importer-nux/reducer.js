/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	IMPORT_IS_SITE_IMPORTABLE_ERROR,
	IMPORT_IS_SITE_IMPORTABLE_RECEIVE,
	IMPORTS_IMPORT_CANCEL,
	IMPORTER_NUX_URL_INPUT_SET,
	IMPORTER_NUX_URL_VALIDATION_SET,
	IMPORT_IS_SITE_IMPORTABLE_START_FETCH,
} from 'state/action-types';

import { registerActionForward } from 'lib/redux-bridge';

registerActionForward( IMPORTS_IMPORT_CANCEL );

export const urlInputValue = createReducer( '', {
	[ IMPORTER_NUX_URL_INPUT_SET ]: ( state, { value = '' } ) => value,
	[ 'FLUX_IMPORTS_IMPORT_CANCEL' ]: () => '',
} );

export const urlInputValidationMessage = ( state = '', action ) =>
	action.type === IMPORTER_NUX_URL_VALIDATION_SET ? action.message : state;

export const isUrlInputDisabled = createReducer( false, {
	[ IMPORT_IS_SITE_IMPORTABLE_START_FETCH ]: () => true,
	[ IMPORT_IS_SITE_IMPORTABLE_RECEIVE ]: () => false,
	[ IMPORT_IS_SITE_IMPORTABLE_ERROR ]: () => false,
	[ 'FLUX_IMPORTS_IMPORT_CANCEL' ]: () => false,
} );

export const siteDetails = createReducer(
	{},
	{
		[ IMPORT_IS_SITE_IMPORTABLE_RECEIVE ]: ( state, { engine, favicon, siteTitle, siteUrl } ) => ( {
			engine,
			favicon,
			siteTitle,
			siteUrl,
		} ),
		[ IMPORT_IS_SITE_IMPORTABLE_ERROR ]: () => ( {} ),
		[ 'FLUX_IMPORTS_IMPORT_CANCEL' ]: () => ( {} ),
	}
);

export const error = createReducer( null, {
	[ IMPORT_IS_SITE_IMPORTABLE_RECEIVE ]: () => null,
	[ IMPORT_IS_SITE_IMPORTABLE_ERROR ]: ( state, action ) => action.error,
	[ 'FLUX_IMPORTS_IMPORT_CANCEL' ]: () => null,
} );

export default combineReducers( {
	error,
	isUrlInputDisabled,
	siteDetails,
	urlInputValue,
	urlInputValidationMessage,
} );
