/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	THEME_UPLOAD_START,
	THEME_UPLOAD_SUCCESS,
	THEME_UPLOAD_FAILURE,
	THEME_UPLOAD_CLEAR,
	THEME_UPLOAD_PROGRESS,
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_INITIATE_PROGRESS,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_STATUS_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE,
} from 'state/action-types';

export const uploadedThemeId = createReducer( {}, {
	[ THEME_UPLOAD_SUCCESS ]: ( state, { siteId, themeId } ) => ( {
		...state,
		[ siteId ]: themeId,
	} ),
	[ THEME_TRANSFER_STATUS_RECEIVE ]: ( state, { siteId, themeId } ) => ( {
		...state,
		[ siteId ]: themeId,
	} ),
	[ THEME_UPLOAD_CLEAR ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
	[ THEME_UPLOAD_START ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
	[ THEME_TRANSFER_INITIATE_REQUEST ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
} );

export const uploadError = createReducer( {}, {
	[ THEME_UPLOAD_FAILURE ]: ( state, { siteId, error } ) => ( {
		...state,
		[ siteId ]: error,
	} ),
	[ THEME_TRANSFER_STATUS_FAILURE ]: ( state, { siteId, error } ) => ( {
		...state,
		[ siteId ]: error,
	} ),
	[ THEME_TRANSFER_INITIATE_FAILURE ]: ( state, { siteId, error } ) => ( {
		...state,
		[ siteId ]: error,
	} ),
	[ THEME_UPLOAD_CLEAR ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
	[ THEME_UPLOAD_START ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
	[ THEME_TRANSFER_INITIATE_REQUEST ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
} );

export const progressLoaded = createReducer( {}, {
	[ THEME_UPLOAD_PROGRESS ]: ( state, { siteId, loaded } ) => ( {
		...state,
		[ siteId ]: loaded,
	} ),
	[ THEME_TRANSFER_INITIATE_PROGRESS ]: ( state, { siteId, loaded } ) => ( {
		...state,
		[ siteId ]: loaded,
	} ),
	[ THEME_UPLOAD_CLEAR ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
	[ THEME_UPLOAD_START ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
	[ THEME_TRANSFER_INITIATE_REQUEST ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
} );

export const progressTotal = createReducer( {}, {
	[ THEME_UPLOAD_PROGRESS ]: ( state, { siteId, total } ) => ( {
		...state,
		[ siteId ]: total,
	} ),
	[ THEME_TRANSFER_INITIATE_PROGRESS ]: ( state, { siteId, total } ) => ( {
		...state,
		[ siteId ]: total,
	} ),
	[ THEME_UPLOAD_CLEAR ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
	[ THEME_UPLOAD_START ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
	[ THEME_TRANSFER_INITIATE_REQUEST ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
} );

export const inProgress = createReducer( {}, {
	[ THEME_UPLOAD_START ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: true,
	} ),
	[ THEME_TRANSFER_INITIATE_REQUEST ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: true,
	} ),
	[ THEME_UPLOAD_CLEAR ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: false,
	} ),
	[ THEME_UPLOAD_SUCCESS ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: false,
	} ),
	[ THEME_UPLOAD_FAILURE ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: false,
	} ),
	[ THEME_TRANSFER_STATUS_RECEIVE ]: ( state, { siteId, status } ) => ( {
		...state,
		[ siteId ]: status !== 'complete',
	} ),
	[ THEME_TRANSFER_INITIATE_FAILURE ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: false,
	} ),
	[ THEME_TRANSFER_STATUS_FAILURE ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: false,
	} ),
} );

export default combineReducers( {
	uploadedThemeId,
	uploadError,
	progressLoaded,
	progressTotal,
	inProgress,
} );
