/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	IMPORT_IS_SITE_IMPORTABLE_ERROR,
	IMPORT_IS_SITE_IMPORTABLE_RECEIVE,
	IMPORT_SIGNUP_SITE_PREVIEW_FETCH,
	IMPORT_SIGNUP_SITE_PREVIEW_RECEIVE,
	IMPORT_SIGNUP_SITE_PREVIEW_ERROR,
	IMPORTS_IMPORT_CANCEL,
	IMPORTER_NUX_FROM_SIGNUP_CLEAR,
	IMPORTER_NUX_FROM_SIGNUP_SET,
	IMPORTER_NUX_URL_INPUT_SET,
	IMPORT_IS_SITE_IMPORTABLE_START_FETCH,
	SIGNUP_PROGRESS_SAVE_STEP,
} from 'state/action-types';

import { registerActionForward } from 'lib/redux-bridge';

registerActionForward( IMPORTS_IMPORT_CANCEL );

export const urlInputValue = createReducer( '', {
	[ IMPORTER_NUX_URL_INPUT_SET ]: ( state, { value = '' } ) => value,
	[ 'FLUX_IMPORTS_IMPORT_CANCEL' ]: () => '',
} );

export const isFromSignupFlow = createReducer( false, {
	[ IMPORTER_NUX_FROM_SIGNUP_SET ]: () => true,
	[ IMPORTER_NUX_FROM_SIGNUP_CLEAR ]: () => false,
} );

export const isUrlInputDisabled = createReducer( false, {
	[ IMPORT_IS_SITE_IMPORTABLE_START_FETCH ]: () => true,
	[ IMPORT_IS_SITE_IMPORTABLE_RECEIVE ]: () => false,
	[ IMPORT_IS_SITE_IMPORTABLE_ERROR ]: () => false,
	[ SIGNUP_PROGRESS_SAVE_STEP ]: () => false,
	[ 'FLUX_IMPORTS_IMPORT_CANCEL' ]: () => false,
} );

export const isSitePreviewLoading = createReducer( false, {
	[ IMPORT_SIGNUP_SITE_PREVIEW_FETCH ]: () => true,
	[ IMPORT_SIGNUP_SITE_PREVIEW_RECEIVE ]: () => false,
	[ IMPORT_SIGNUP_SITE_PREVIEW_ERROR ]: () => false,
} );

export const siteDetails = createReducer( null, {
	[ IMPORT_IS_SITE_IMPORTABLE_RECEIVE ]: ( state, { engine, favicon, siteTitle, siteUrl } ) => ( {
		engine,
		favicon,
		siteTitle,
		siteUrl,
	} ),
	[ IMPORT_IS_SITE_IMPORTABLE_ERROR ]: () => null,
	[ 'FLUX_IMPORTS_IMPORT_CANCEL' ]: () => null,
} );

export const error = createReducer( null, {
	[ IMPORT_IS_SITE_IMPORTABLE_START_FETCH ]: () => null,
	[ IMPORT_IS_SITE_IMPORTABLE_RECEIVE ]: () => null,
	[ IMPORT_IS_SITE_IMPORTABLE_ERROR ]: ( state, action ) => action.error,
	[ 'FLUX_IMPORTS_IMPORT_CANCEL' ]: () => null,
} );

export default combineReducers( {
	error,
	isFromSignupFlow,
	isUrlInputDisabled,
	siteDetails,
	urlInputValue,
	isSitePreviewLoading,
} );
