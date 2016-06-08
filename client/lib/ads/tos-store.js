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

var _tos = {},
	_loadingError = null,
	_notice = null,
	_isLoading = false,
	WordadsTosStore;

WordadsTosStore = {
	get: function() {
		return _tos;
	},

	getById: function( siteId ) {
		return {
			tos: _tos.hasOwnProperty( siteId ) ? _tos[ siteId ] : null,
			isLoading: _isLoading,
			error: _loadingError,
			notice: _notice
		};
	},

	isLoading: function() {
		return _isLoading;
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

	emitChange: function() {
		this.emit( 'change' );
	}
};

function updateTos( siteId, data ) {
	_tos[ siteId ] = data.tos;
	_loadingError = null;
}

function setLoadingError( error ) {
	_loadingError = error;
}

WordadsTosStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;
	switch ( action.type ) {
		case 'FETCHING_WORDADS_TOS':
		case 'SIGNING_WORDADS_TOS':
			debug( 'WordadsTosStore SIGNING/FETCHING_WORDADS_TOS', action );
			_isLoading = true;
			_notice = null;
			WordadsTosStore.emitChange();
			break;
		case 'SIGN_WORDADS_TOS':
			_notice = i18n.translate( 'Thank you for accepting WordAds Terms of Service.' );
		case 'RECEIVE_WORDADS_TOS':
			debug( 'WordadsTosStore SIGN/RECEIVE_WORDADS_TOS', action );
			_isLoading = false;
			if ( action.error ) {
				setLoadingError( action.error );
				_notice = null;
			} else {
				updateTos( action.site.ID, action.data );
			}

			WordadsTosStore.emitChange();
			break;
	}
} );

emitter( WordadsTosStore );

module.exports = WordadsTosStore;
