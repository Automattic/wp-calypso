/**
 * External dependencies
 */

import { forOwn } from 'lodash';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import emitter from 'lib/mixins/emitter';
import PreferencesConstants from './constants';

/**
 * Module variables
 */
const PreferencesStore = {
	_preferences: undefined,
};

emitter( PreferencesStore );

function ensurePreferencesObject() {
	if ( ! PreferencesStore._preferences ) {
		PreferencesStore._preferences = {};
	}
}

function receiveSingle( key, value ) {
	ensurePreferencesObject();

	if ( null === value ) {
		delete PreferencesStore._preferences[ key ];
	} else {
		PreferencesStore._preferences[ key ] = value;
	}
}

function receiveMany( preferences ) {
	ensurePreferencesObject();

	forOwn( preferences, function( value, key ) {
		receiveSingle( key, value );
	} );
}

/**
 * Returns an object of all key-value pairs in the store
 *
 * @returns {object} All key-value pairs in the store
 */
PreferencesStore.getAll = function() {
	return PreferencesStore._preferences;
};

/**
 * Returns the value of a single item from the store
 *
 * @param  {string} key The key of the item
 * @returns {*}          The value of the item
 */
PreferencesStore.get = function( key ) {
	if ( PreferencesStore._preferences ) {
		return PreferencesStore._preferences[ key ];
	}
};

PreferencesStore.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload.action;

	switch ( action.type ) {
		case 'UPDATE_ME_SETTINGS':
		case 'RECEIVE_ME_SETTINGS':
			if ( ! action.error && action.data && action.data[ PreferencesConstants.USER_SETTING_KEY ] ) {
				receiveMany( action.data[ PreferencesConstants.USER_SETTING_KEY ] );
				PreferencesStore.emit( 'change' );
			}
			break;
	}
} );

export default PreferencesStore;
