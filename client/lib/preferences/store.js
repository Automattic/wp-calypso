/**
 * External dependencies
 */
var forOwn = require( 'lodash/forOwn' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	emitter = require( 'lib/mixins/emitter' ),
	PreferencesConstants = require( './constants' );

/**
 * Module variables
 */
var PreferencesStore = {},
	_preferences;

emitter( PreferencesStore );

function ensurePreferencesObject() {
	if ( ! _preferences ) {
		_preferences = {};
	}
}

function receiveSingle( key, value ) {
	ensurePreferencesObject();

	if ( null === value ) {
		delete _preferences[ key ];
	} else {
		_preferences[ key ] = value;
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
 * @return {Object} All key-value pairs in the store
 */
PreferencesStore.getAll = function() {
	return _preferences;
};

/**
 * Returns the value of a single item from the store
 *
 * @param  {string} key The key of the item
 * @return {*}          The value of the item
 */
PreferencesStore.get = function( key ) {
	if ( _preferences ) {
		return _preferences[ key ];
	}
};

PreferencesStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

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

module.exports = PreferencesStore;
