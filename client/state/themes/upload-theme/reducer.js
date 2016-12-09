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
} from 'state/action-types';

export const uploadedThemeId = createReducer( {}, {
	[ THEME_UPLOAD_SUCCESS ]: ( state, { siteId, themeId } ) => ( {
		...state,
		[ siteId ]: themeId,
	} ),
	[ THEME_UPLOAD_CLEAR ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
	[ THEME_UPLOAD_START ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
} );

export const uploadError = createReducer( {}, {
	[ THEME_UPLOAD_FAILURE ]: ( state, { siteId, error } ) => ( {
		...state,
		[ siteId ]: error,
	} ),
	[ THEME_UPLOAD_CLEAR ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
	[ THEME_UPLOAD_START ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
} );

export const progressLoaded = createReducer( {}, {
	[ THEME_UPLOAD_PROGRESS ]: ( state, { siteId, loaded } ) => ( {
		...state,
		[ siteId ]: loaded,
	} ),
	[ THEME_UPLOAD_CLEAR ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
	[ THEME_UPLOAD_START ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
} );

export const progressTotal = createReducer( {}, {
	[ THEME_UPLOAD_PROGRESS ]: ( state, { siteId, total } ) => ( {
		...state,
		[ siteId ]: total,
	} ),
	[ THEME_UPLOAD_CLEAR ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
	[ THEME_UPLOAD_START ]: ( state, { siteId } ) => ( omit( state, siteId ) ),
} );

export const inProgress = createReducer( {}, {
	[ THEME_UPLOAD_START ]: ( state, { siteId } ) => ( {
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
} );

export default combineReducers( {
	uploadedThemeId,
	uploadError,
	progressLoaded,
	progressTotal,
	inProgress,
} );
