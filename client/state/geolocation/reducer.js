/**
 * External Dependencies
 */
import { combineReducers } from 'redux';
import camelCase from 'lodash/camelCase';
import mapKeys from 'lodash/mapKeys';

/**
 * Internal Dependencies
 */
import {
	GEOLOCATION_FETCH_COMPLETED
} from 'state/action-types';
import { geolocationSchema } from './schema';
import { createReducer } from 'state/utils';

const locationReducer = createReducer( {}, {
	[ GEOLOCATION_FETCH_COMPLETED ]: ( state, { location } ) => mapKeys( location, camelCase )
}, geolocationSchema );

export default combineReducers( {
	location: locationReducer
} );
