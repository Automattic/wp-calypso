/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import get from 'lodash/get';
import mapValues from 'lodash/mapValues';
import { createReducer } from 'state/utils';
/**
 * Internal dependencies
 */
import {
	CURRENT_USER_SETTINGS_RECEIVE,
	CURRENT_USER_SETTINGS_REQUEST_SUCCESS,
	PREFERENCES_SET
} from 'state/action-types';
import { USER_SETTING_KEY, DEFAULT_PREFERENCES } from './constants';

export function createReducerForPreferenceKey( key, defaultValue = null, schema = null ) {
	const handlePreferencesFromApi = ( state, action ) => get( action, [ 'data', USER_SETTING_KEY, key ], state );
	return createReducer( defaultValue, {
		[ PREFERENCES_SET ]: ( state, action ) => ( action.key === key ) ? action.value : state,
		[ CURRENT_USER_SETTINGS_RECEIVE ]: handlePreferencesFromApi,
		[ CURRENT_USER_SETTINGS_REQUEST_SUCCESS ]: handlePreferencesFromApi
	}, schema );
}

const values = combineReducers( mapValues( DEFAULT_PREFERENCES,
	( value, key ) => createReducerForPreferenceKey( key, value.default, value.schema )
) );

const lastFetchedTimestamp = createReducer( false, {
	[ CURRENT_USER_SETTINGS_REQUEST_SUCCESS ]: () => Date.now(),
} );

export default combineReducers( {
	values,
	lastFetchedTimestamp,
} );
