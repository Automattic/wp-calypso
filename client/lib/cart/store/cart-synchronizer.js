/**
 * External dependencies
 */
import { assign, flowRight, get } from 'lodash';
import Dispatcher from 'dispatcher';
import { TRANSACTION_STEP_SET } from 'lib/transaction/action-types';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Emitter from 'lib/mixins/emitter';
import { preprocessCartForServer } from 'lib/cart-values';

/**
 * Internal dependencies
 */
const debug = debugFactory( 'calypso:cart-data:cart-synchronizer' );

function preprocessCartFromServer( cart ) {
	return assign( {}, cart, {
		client_metadata: createClientMetadata(),
		products: castProductIDsToNumbers( cart.products ),
		tax: castTaxObject( cart.tax ), // cast tax.location to object
	} );
}

// Add a server response date so we can distinguish between carts with the
// same attributes from the server.
//
// NOTE: This object has underscored keys to match the rest of the attributes
//   in the `CartValue object`.
function createClientMetadata() {
	return { last_server_response_date: new Date().toISOString() };
}

// FIXME: Temporary fix to cast string product IDs to numbers. There is a bug
//   with the API where it sometimes returns product IDs as strings.
function castProductIDsToNumbers( cartItems ) {
	return cartItems.map( function ( item ) {
		return assign( {}, item, { product_id: parseInt( item.product_id, 10 ) } );
	} );
}

// The API is returning arrays for location that mess with our
// immutability-helper functions, so we need to make sure to convert
// these to objects. We should be able to remove this after that's fixed.
function castTaxObject( tax ) {
	return {
		...tax,
		location: { ...get( tax, 'location' ) }, // cast location to object
	};
}

function CartSynchronizer( cartKey, wpcom ) {
	if ( ! ( this instanceof CartSynchronizer ) ) {
		return new CartSynchronizer( cartKey, wpcom );
	}

	this._cartKey = cartKey;
	this._wpcom = wpcom;
	this._latestValue = null;
	this._hasLoadedFromServer = false;
	this._activeRequest = null;
	this._queuedChanges = null;
	this._paused = false;

	this.dispatchToken = Dispatcher.register( this.handleDispatch.bind( this ) );
}

Emitter( CartSynchronizer.prototype );

CartSynchronizer.prototype.handleDispatch = function ( { action } ) {
	switch ( action.type ) {
		case TRANSACTION_STEP_SET:
			if ( action.step.first && ! action.step.last ) {
				this.pause();
			}

			if ( action.step.last && ! action.step.first ) {
				this.resume();
			}
	}
};

CartSynchronizer.prototype.update = function ( changeFunction ) {
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
};

CartSynchronizer.prototype.pause = function () {
	this._paused = true;
};

CartSynchronizer.prototype.resume = function () {
	this._paused = false;
};

CartSynchronizer.prototype._enqueueChange = function ( changeFunction ) {
	if ( this._queuedChanges ) {
		this._queuedChanges = flowRight( changeFunction, this._queuedChanges );
	} else {
		this._queuedChanges = changeFunction;
	}
};

CartSynchronizer.prototype._processQueuedChanges = function () {
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

CartSynchronizer.prototype._postToServer = function ( callback ) {
	this._wpcom.setCart( this._cartKey, preprocessCartForServer( this._latestValue ), function (
		error,
		newValue
	) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, preprocessCartFromServer( newValue ) );
	} );
};

CartSynchronizer.prototype._poll = function () {
	this._performRequest( 'poll', this._getFromServer.bind( this ) );
};

CartSynchronizer.prototype.fetch = function () {
	this._performRequest( 'fetch', this._getFromServer.bind( this ) );
};

CartSynchronizer.prototype._getFromServer = function ( callback ) {
	this._wpcom.getCart( this._cartKey, function ( error, newValue ) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, preprocessCartFromServer( newValue ) );
	} );
};

let requestCounter = 0;

CartSynchronizer.prototype._performRequest = function ( type, requestFunction ) {
	if ( type === 'poll' && this._paused ) {
		return;
	}

	if ( this._activeRequest && this._activeRequest.state === 'pending' ) {
		return false;
	}

	const request = {
		id: requestCounter++,
		type: type,
		state: 'pending',
	};

	this._activeRequest = request;

	debug( request.id + ': starting ' + request.type );

	requestFunction(
		function onResponse( error, newValue ) {
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
		}.bind( this )
	);
};

CartSynchronizer.prototype.getLatestValue = function () {
	if ( ! this._hasLoadedFromServer ) {
		throw new Error( 'Value cannot be read before fetching from the server at least once.' );
	}

	return this._latestValue;
};

CartSynchronizer.prototype.hasLoadedFromServer = function () {
	return this._hasLoadedFromServer;
};

CartSynchronizer.prototype.hasPendingServerUpdates = function () {
	return (
		this._activeRequest &&
		this._activeRequest.type === 'update' &&
		this._activeRequest.state === 'pending'
	);
};

export default CartSynchronizer;
