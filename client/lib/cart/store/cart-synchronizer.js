/**
 * External dependencies
 */
var assign = require( 'lodash/assign' ),
	i18n = require( 'lib/mixins/i18n' ),
	omit = require( 'lodash/omit' ),
	flowRight = require( 'lodash/flowRight' ),
	Dispatcher = require( 'dispatcher' ),
	upgradesActionTypes = require( 'lib/upgrades/constants' ).action,
	debug = require( 'debug' )( 'calypso:cart-data:cart-synchronizer' );

/**
 * Internal dependencies
 */
var Emitter = require( 'lib/mixins/emitter' ),
	cartLib = require( 'lib/cart' );

function CartSynchronizer( siteID ) {
	if ( ! ( this instanceof CartSynchronizer ) ) {
		return new CartSynchronizer( siteID );
	}

	this._siteID = siteID;
	this._latestValue = null;
	this._hasLoadedFromServer = false;
	this._activeRequest = null;
	this._queuedChanges = null;
	this._paused = false;

	this.dispatchToken = Dispatcher.register( this.handleDispatch.bind( this ) );
}

Emitter( CartSynchronizer.prototype );

CartSynchronizer.prototype.handleDispatch = function( payload ) {
	var action = payload.action,
		step;

	if ( action.type !== upgradesActionTypes.TRANSACTION_STEP_SET ) {
		return;
	}

	step = action.step;

	if ( step.first && step.last ) {
		return;
	}

	if ( step.first ) {
		this.pause();
	} else if ( step.last ) {
		this.resume();
	}
};

CartSynchronizer.prototype.update = function( changeFunction ) {
	if ( ! this._hasLoadedFromServer ) {
		// If we haven't loaded any data from the server yet, it's possible that
		// the local data could completely overwrite the existing data. This would
		// happen if we applied the change to the local data and sent it to the
		// server immediately at this point.
		//
		// When the program first runs, the most up-to-date version of the data is
		// on the server. We need to fetch from the server at least once to end up
		// with a consistent state when we apply our local changes. The strategy
		// here is to queue the changes until the first request has completed, then
		// proceed as normal.
		this._enqueueChange( changeFunction );
		return;
	}

	if ( this._activeRequest && this._activeRequest.state !== 'canceled' ) {
		this._activeRequest.state = 'canceled';
	}

	this._latestValue = changeFunction( this._latestValue );
	this._performRequest( 'update', this._postToServer.bind( this ) );
	this.emit( 'change' );
};

CartSynchronizer.prototype.pause = function() {
	this._paused = true;
};

CartSynchronizer.prototype.resume = function() {
	this._paused = false;
};

CartSynchronizer.prototype._enqueueChange = function( changeFunction ) {
	if ( this._queuedChanges ) {
		this._queuedChanges = flowRight( changeFunction, this._queuedChanges );
	} else {
		this._queuedChanges = changeFunction;
	}
};

CartSynchronizer.prototype._processQueuedChanges = function() {
	if ( ! this._queuedChanges ) {
		return;
	}

	if ( this._activeRequest && this._activeRequest.state !== 'canceled' ) {
		this._activeRequest.state = 'canceled';
	}

	this._latestValue = this._queuedChanges( this._latestValue );
	this._queuedChanges = null;

	this._performRequest( 'update', this._postToServer.bind( this ) );
};

CartSynchronizer.prototype._postToServer = function( callback ) {
	cartLib.updateCart( this._latestValue, callback );
};

CartSynchronizer.prototype._poll = function() {
	this._performRequest( 'poll', this._getFromServer.bind( this ) );
};

CartSynchronizer.prototype.fetch = function() {
	this._performRequest( 'fetch', this._getFromServer.bind( this ) );
};

CartSynchronizer.prototype._getFromServer = function( callback ) {
	cartLib.getSavedCart( this._siteID, callback );
};

var requestCounter = 0;

CartSynchronizer.prototype._performRequest = function( type, requestFunction ) {
	var request;

	if ( type === 'poll' && this._paused ) {
		return;
	}

	if ( this._activeRequest && this._activeRequest.state === 'pending' ) {
		return false;
	}

	request = {
		id: requestCounter++,
		type: type,
		state: 'pending'
	};
	this._activeRequest = request;

	debug( request.id + ': starting ' + request.type );

	requestFunction( function onResponse( error, newValue ) {
		if ( request.state === 'canceled' ) {
			debug( request.id + ': canceled ' + request.type );
			return;
		}

		if ( error ) {
			throw error;
		}
		debug( request.id + ': finishing ' + request.type );

		this._latestValue = newValue;
		request.state = 'completed';

		if ( ! this._hasLoadedFromServer ) {
			this._processQueuedChanges();
			this._hasLoadedFromServer = true;
		}

		this.emit( 'change' );
	}.bind( this ) );
};

CartSynchronizer.prototype.getLatestValue = function() {
	if ( ! this._hasLoadedFromServer ) {
		throw new Error( 'Value cannot be read before fetching from the server at least once.' );
	}

	return this._latestValue;
};

CartSynchronizer.prototype.hasLoadedFromServer = function() {
	return this._hasLoadedFromServer;
};

CartSynchronizer.prototype.hasPendingServerUpdates = function() {
	return (
		this._activeRequest &&
		this._activeRequest.type === 'update' &&
		this._activeRequest.state === 'pending'
	);
};

module.exports = CartSynchronizer;
