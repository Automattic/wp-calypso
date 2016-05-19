/**
 * External dependencies
 */
import debugModule from 'debug';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import emitter from 'lib/mixins/emitter';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:wordads:store' );

var _settings = {},
	_loadingError = null,
	_notice = null,
	_isLoading = false,
	_isSubmitting = false,
	WordadsSettingsStore;

WordadsSettingsStore = {
	get: function() {
		return _settings;
	},

	getById: function( siteId ) {
		var settings = _settings.hasOwnProperty( siteId ) ? _settings[ siteId ] : {};
		settings.isLoading = _isLoading;
		settings.isSubmitting = _isSubmitting;
		settings.error = _loadingError;
		settings.notice = _notice;
		return settings;
	},

	isLoading: function() {
		return _isLoading;
	},

	isSubmitting: function() {
		return _isSubmitting;
	},

	getLoadingError: function() {
		return _loadingError;
	},

	getNotice: function() {
		return _notice;
	},

	clearNotices: function() {
		_notice = null;
		_loadingError = null;
	},

	settingsLoaded: function( siteId ) {
		return _settings.hasOwnProperty( siteId ) && 'undefined' !== typeof _settings[ siteId ].tos;
	},

	emitChange: function() {
		this.emit( 'change' );
	}
};

function updateSettings( siteId, data ) {
	_settings[ siteId ] = data.hasOwnProperty( 'settings' ) ? data.settings : data.updated;
	_loadingError = null;
}

function setLoadingError( error ) {
	_loadingError = error;
}

WordadsSettingsStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;
	switch ( action.type ) {
		case 'UPDATING_WORDADS_SETTINGS':
			_isSubmitting = true;
		case 'FETCHING_WORDADS_SETTINGS':
			debug( 'WordadsSettingsStore FETCHING/UPDATING_WORDADS_SETTINGS', action );
			setLoadingError( null );
			_isLoading = true;
			_notice = null;
			WordadsSettingsStore.emitChange();
			break;
		case 'UPDATED_WORDADS_SETTINGS':
			_notice = i18n.translate( 'WordAds settings saved successfully!' );
		case 'RECEIVE_WORDADS_SETTINGS':
			debug( 'WordadsSettingsStore UPDATE/RECEIVE_WORDADS_SETTINGS', action );
			_isLoading = false;
			_isSubmitting = false;
			if ( action.error ) {
				setLoadingError( action.error );
				_notice = null;
			} else {
				updateSettings( action.site.ID, action.data );
			}

			WordadsSettingsStore.emitChange();
			break;
	}
} );

emitter( WordadsSettingsStore );

module.exports = WordadsSettingsStore;
