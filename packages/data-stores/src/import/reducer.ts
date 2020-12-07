/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { ImportableSiteData, ImportableSiteErrorResponse } from './types';
import type { ImportAction } from './actions';

export const importUrl: Reducer< string, ImportAction > = ( state = '', action ) => {
	if ( action.type === 'SET_IMPORT_URL' ) {
		return action.url;
	}
	return state;
};

export const importableSiteData: Reducer< ImportableSiteData | undefined, ImportAction > = (
	state,
	action
) => {
	if ( action.type === 'RECEIVE_IMPORTABLE_SITE' ) {
		return action.response;
	} else if ( action.type === 'RECEIVE_IMPORTABLE_SITE_FAILED' ) {
		return undefined;
	}
	return state;
};

export const importableSiteError: Reducer<
	ImportableSiteErrorResponse | undefined,
	ImportAction
> = ( state, action ) => {
	switch ( action.type ) {
		case 'RECEIVE_IMPORTABLE_SITE_FAILED':
			return action.error;
		case 'IMPORTABLE_SITE':
		case 'RECEIVE_IMPORTABLE_SITE':
		case 'CLEAR_ERRORS':
			return undefined;
	}
	return state;
};

export const isCheckingImportableSite: Reducer< boolean | undefined, ImportAction > = (
	state = false,
	action
) => {
	switch ( action.type ) {
		case 'IMPORTABLE_SITE':
			return true;
		case 'RECEIVE_IMPORTABLE_SITE':
		case 'RECEIVE_IMPORTABLE_SITE_FAILED':
			return false;
	}
	return state;
};

const reducer = combineReducers( {
	importUrl,
	importableSiteData,
	importableSiteError,
	isCheckingImportableSite,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
