/**
 * External dependencies
 */
var wpcomFactory = require( 'wpcom-unpublished' ),
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
 * @param {String} [token] - oauth token
 * @param {Function} [reqHandler] - request handler
 * @return {NUll} null
 */
function WPCOMUndocumented( token, reqHandler ) {
	if ( ! ( this instanceof WPCOMUndocumented ) ) {
		return new WPCOMUndocumented( token, reqHandler );
	}

	if ( 'function' === typeof token ) {
		reqHandler = token;
		token = null;
	} else {
		this.loadToken( token );
	}

	wpcomFactory.call( this, token, function( params, fn ) {
		if ( this.isTokenLoaded() ) {
			// authToken is used in wpcom-xhr-request,
			// which is used for the signup flow in the REST Proxy
			params = assign(
				{},
				params,
				{ authToken: this._token, token: this._token }
			);
		}

		return reqHandler( params, fn );
	} );

	debug( 'Extending wpcom with undocumented endpoints.' );
}

inherits( WPCOMUndocumented, wpcomFactory );

/**
 * Get `Undocumented` object instance
 *
 * @return {Undocumented} Undocumented instance
 */
wpcomFactory.prototype.undocumented = function() {
	return new Undocumented( this );
};

/**
 * Add a token to this instance of WPCOM.
 * When loaded, the token is applied to the param object of each subsequent request.
 *
 * @param {String} [token] - oauth token
 */
wpcomFactory.prototype.loadToken = function( token ) {
	this._token = token;
};

/**
 * Returns a boolean representing whether or not the token has been loaded.
 *
 * @return {String} oauth token
 */
wpcomFactory.prototype.isTokenLoaded = function() {
	return this._token !== undefined;
};

/**
 * Expose `WPCOMUndocumented`
 */
module.exports = WPCOMUndocumented;
