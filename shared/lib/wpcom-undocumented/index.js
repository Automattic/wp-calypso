/**
 * External dependencies
 */
var WPCOM = require( 'wpcom-unpublished' ),
	inherits = require( 'inherits' ),
	assign = require( 'lodash/object/assign' ),
	debug = require( 'debug' )( 'calypso:wpcom-undocumented' );

/**
 * Internal dependencies
 */
var Undocumented = require( './lib/undocumented' );

/**
 * Add special methods to WPCOM class
 *
 * @param {String} [token]
 * @param {Function} [reqHandler]
 * @api public
 */
function WPCOMPlus( token, reqHandler ) {
	if ( ! ( this instanceof WPCOMPlus ) ) {
		return new WPCOMPlus( token, reqHandler );
	}

	if ( 'function' === typeof token ) {
		reqHandler = token;
		token = null;
	} else {
		this.loadToken( token );
	}

	WPCOM.call( this, token, function( params, fn ) {
		if ( this.isTokenLoaded() ) {
			// authToken is used in wpcom-xhr-request, which is used for the signup flow in the REST Proxy
			params = assign( {}, params, { authToken: this._token, token: this._token } );
		}

		return reqHandler( params, fn );
	} );
	debug( 'Extending wpcom with undocumented endpoints.' );
}

inherits( WPCOMPlus, WPCOM );

/**
 * Get `Undocumented` object instance
 *
 * @api public
 */
WPCOM.prototype.undocumented = function() {
	return new Undocumented( this );
};

/**
 * Add a token to this instance of WPCOM.
 * When loaded, the token is applied to the param object of each subsequent request.
 *
 * @param {String} [token]
 */
WPCOM.prototype.loadToken = function( token ) {
	this._token = token;
};

/**
 * Returns a boolean representing whether or not the token has been loaded.
 */
WPCOM.prototype.isTokenLoaded = function() {
	return this._token !== undefined;
};

/**
 * Expose `WPCOMPlus`
 */
module.exports = WPCOMPlus;
