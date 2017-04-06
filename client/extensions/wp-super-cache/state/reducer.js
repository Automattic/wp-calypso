/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	WP_SUPER_CACHE_RECEIVE_SETTINGS,
} from './action-types';

/**
 * Tracks the settings for a particular site.
 *
 * @param  {String} state Current settings
 * @param  {Object} action Action object
 * @return {String} Updated settings
 */
const settings = ( state = {}, { type, siteId, data } ) => {
	if ( WP_SUPER_CACHE_RECEIVE_SETTINGS === type ) {
		return { ...state, [ siteId ]: data };
	}

	return state;
};

export default combineReducers( {
	settings,
} );
