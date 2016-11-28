/**
 * External dependencies
 */
import { combineReducers } from 'redux';

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

const clearState = function( state, { siteId } ) {
	const newState = Object.assign( {}, state );
	delete newState[ siteId ];
	return newState;
};

// Returns a func that sets state to be the specified action property,
// or true if no property supplied
const setState = function( actionProp ) {
	return ( state, action ) => {
		const { siteId } = action;
		const newState = Object.assign( {}, state );
		newState[ siteId ] = actionProp ? action[ actionProp ] : true;
		return newState;
	};
};

export const uploadedTheme = createReducer( {}, {
	[ THEME_UPLOAD_SUCCESS ]: setState( 'theme' ),
	[ THEME_UPLOAD_CLEAR ]: clearState,
	[ THEME_UPLOAD_START ]: clearState,
} );

export const uploadError = createReducer( {}, {
	[ THEME_UPLOAD_FAILURE ]: setState( 'error' ),
	[ THEME_UPLOAD_CLEAR ]: clearState,
	[ THEME_UPLOAD_START ]: clearState,
} );

export const progressLoaded = createReducer( {}, {
	[ THEME_UPLOAD_PROGRESS ]: setState( 'loaded' ),
	[ THEME_UPLOAD_CLEAR ]: clearState,
	[ THEME_UPLOAD_START ]: clearState,
} );

export const progressTotal = createReducer( {}, {
	[ THEME_UPLOAD_PROGRESS ]: setState( 'total' ),
	[ THEME_UPLOAD_CLEAR ]: clearState,
	[ THEME_UPLOAD_START ]: clearState,
} );

export const inProgress = createReducer( {}, {
	[ THEME_UPLOAD_START ]: setState(),
	[ THEME_UPLOAD_CLEAR ]: clearState,
	[ THEME_UPLOAD_SUCCESS ]: clearState,
	[ THEME_UPLOAD_FAILURE ]: clearState,
} );

export default combineReducers( {
	uploadedTheme,
	uploadError,
	progressLoaded,
	progressTotal,
	inProgress,
} );
