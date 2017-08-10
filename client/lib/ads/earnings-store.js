/** @format */
/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import emitter from 'lib/mixins/emitter';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:wordads:store' );

var _earnings = {},
	_loadingError = null,
	_isLoading = false,
	EarningsStore;

EarningsStore = {
	get: function() {
		return _earnings;
	},

	getById: function( siteId ) {
		return {
			earnings: _earnings.hasOwnProperty( siteId ) ? _earnings[ siteId ] : null,
			isLoading: _isLoading,
			error: _loadingError,
		};
	},

	isLoading: function() {
		return _isLoading;
	},

	getLoadingError: function() {
		return _loadingError;
	},

	emitChange: function() {
		this.emit( 'change' );
	},
};

function updateEarnings( siteId, data ) {
	_earnings[ siteId ] = data.earnings;
	_loadingError = null;
}

function setLoadingError( error ) {
	_loadingError = error;
}

EarningsStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;
	switch ( action.type ) {
		case 'FETCHING_EARNINGS':
			debug( 'EarningsStore FETCHING_EARNINGS', action );
			_isLoading = true;
			EarningsStore.emitChange();
			break;
		case 'RECEIVE_EARNINGS':
			debug( 'EarningsStore RECEIVE_EARNINGS', action );
			_isLoading = false;
			if ( action.error ) {
				setLoadingError( action.error );
			} else {
				updateEarnings( action.site.ID, action.data );
			}

			EarningsStore.emitChange();
			break;
	}
} );

emitter( EarningsStore );

module.exports = EarningsStore;
