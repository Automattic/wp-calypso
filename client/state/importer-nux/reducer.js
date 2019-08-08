/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	IMPORTER_NUX_SITE_DETAILS_SET,
	IMPORTS_IMPORT_CANCEL,
	IMPORTER_NUX_FROM_SIGNUP_CLEAR,
	IMPORTER_NUX_FROM_SIGNUP_SET,
	IMPORTER_NUX_URL_INPUT_SET,
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

export const siteDetails = createReducer( null, {
	[ IMPORTER_NUX_SITE_DETAILS_SET ]: (
		state,
		{ siteEngine, siteFavicon, siteTitle, siteUrl, importerTypes }
	) => ( {
		siteEngine,
		siteFavicon,
		siteTitle,
		siteUrl,
		importerTypes,
	} ),
	[ 'FLUX_IMPORTS_IMPORT_CANCEL' ]: () => null,
} );

export default combineReducers( {
	isFromSignupFlow,
	siteDetails,
	urlInputValue,
} );
