/**
 * External dependencies
 */
var store = require( 'store' ),
	forOwn = require( 'lodash/object/forOwn' ),
	wpcom = require( 'lib/wp' ).undocumented();

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	PreferencesConstants = require( './constants' );

/**
 * Module variables
 */
var PreferencesActions = {},
	_pendingUpdates = 0;

function getLocalStorage() {
	return store.get( PreferencesConstants.LOCALSTORAGE_KEY );
}

function mergePreferencesToLocalStorage( preferences ) {
	var storage = getLocalStorage() || {};

	forOwn( preferences, function( value, key ) {
		if ( null === value ) {
			delete storage[ key ];
		} else {
			storage[ key ] = value;
		}
	} );

	store.set( PreferencesConstants.LOCALSTORAGE_KEY, storage );
}

PreferencesActions.fetch = function() {
	var localStorage = getLocalStorage();

	Dispatcher.handleViewAction( {
		type: 'FETCH_ME_SETTINGS'
	} );

	if ( localStorage ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_ME_SETTINGS',
			data: { [ PreferencesConstants.USER_SETTING_KEY ]: localStorage }
		} );
	}

	wpcom.me().settings().get( function( error, data ) {
		if ( ! error && data ) {
			mergePreferencesToLocalStorage( data[ PreferencesConstants.USER_SETTING_KEY ] );
		}

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_ME_SETTINGS',
			error: error,
			data: data
		} );
	} );
};

PreferencesActions.set = function( key, value ) {
	var preferences = {},
		settings = {};

	preferences[ key ] = value;
	settings[ PreferencesConstants.USER_SETTING_KEY ] = preferences;

	Dispatcher.handleViewAction( {
		type: 'UPDATE_ME_SETTINGS',
		data: settings
	} );

	mergePreferencesToLocalStorage( preferences );

	_pendingUpdates++;
	wpcom.me().saveSettings( JSON.stringify( settings ), function( error, data ) {
		if ( --_pendingUpdates ) {
			return;
		}

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_ME_SETTINGS',
			error: error,
			data: data
		} );
	} );
};

PreferencesActions.remove = function( key ) {
	PreferencesActions.set( key, null );
};

module.exports = PreferencesActions;
