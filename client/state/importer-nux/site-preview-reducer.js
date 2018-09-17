/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	IMPORTER_NUX_SITE_PREVIEW_FETCH,
	IMPORTER_NUX_SITE_PREVIEW_RECEIVE,
	IMPORTER_NUX_SITE_PREVIEW_FAIL,
} from 'state/action-types';

export const fetching = createReducer( false, {
	[ IMPORTER_NUX_SITE_PREVIEW_FETCH ]: () => true,
	[ IMPORTER_NUX_SITE_PREVIEW_RECEIVE ]: () => false,
	[ IMPORTER_NUX_SITE_PREVIEW_FAIL ]: () => false,
} );

export const image = createReducer( null, {
	[ IMPORTER_NUX_SITE_PREVIEW_FETCH ]: () => null,
	[ IMPORTER_NUX_SITE_PREVIEW_RECEIVE ]: ( state, { imageBlob } ) => imageBlob,
	[ IMPORTER_NUX_SITE_PREVIEW_FAIL ]: () => null,
} );

export const error = createReducer( null, {
	[ IMPORTER_NUX_SITE_PREVIEW_FETCH ]: () => null,
	[ IMPORTER_NUX_SITE_PREVIEW_RECEIVE ]: () => null,
	[ IMPORTER_NUX_SITE_PREVIEW_FAIL ]: ( state, { error } ) => error,
} );

export default combineReducers( {
	fetching,
	image,
	error,
} );
