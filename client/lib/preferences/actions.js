/**
 * External dependencies
 */

import { forOwn } from 'lodash';
import store from 'store';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import PreferencesConstants from './constants';
import userUtils from 'lib/user/utils';
import wp from 'lib/wp';

/**
 * Module variables
 */
const wpcom = wp.undocumented();
const PreferencesActions = {};
let _pendingUpdates = 0;

function getLocalStorage() {
	return store.get( PreferencesConstants.LOCALSTORAGE_KEY );
}

PreferencesActions.mergePreferencesToLocalStorage = function( preferences ) {
	const storage = getLocalStorage() || {};

	forOwn( preferences, function( value, key ) {
		if ( null === value ) {
			delete storage[ key ];
		} else {
			storage[ key ] = value;
		}
	} );

	store.set( PreferencesConstants.LOCALSTORAGE_KEY, storage );
};

PreferencesActions.fetch = function() {
	const localStorage = getLocalStorage();

	if ( ! userUtils.isLoggedIn() ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: 'FETCH_ME_SETTINGS',
	} );

	if ( localStorage ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_ME_SETTINGS',
			data: { [ PreferencesConstants.USER_SETTING_KEY ]: localStorage },
		} );
	}

	wpcom
		.me()
		.settings()
		.get( function( error, data ) {
			if ( ! error && data ) {
				PreferencesActions.mergePreferencesToLocalStorage(
					data[ PreferencesConstants.USER_SETTING_KEY ]
				);
			}

			Dispatcher.handleServerAction( {
				type: 'RECEIVE_ME_SETTINGS',
				error: error,
				data: data,
			} );
		} );
};

PreferencesActions.set = function( key, value ) {
	let preferences = {},
		settings = {};

	preferences[ key ] = value;
	settings[ PreferencesConstants.USER_SETTING_KEY ] = preferences;

	Dispatcher.handleViewAction( {
		type: 'UPDATE_ME_SETTINGS',
		data: settings,
	} );

	PreferencesActions.mergePreferencesToLocalStorage( preferences );

	_pendingUpdates++;
	wpcom
		.me()
		.settings()
		.update( JSON.stringify( settings ), function( error, data ) {
			if ( --_pendingUpdates ) {
				return;
			}

			Dispatcher.handleServerAction( {
				type: 'RECEIVE_ME_SETTINGS',
				error: error,
				data: data,
			} );
		} );
};

PreferencesActions.remove = function( key ) {
	PreferencesActions.set( key, null );
};

export default PreferencesActions;
