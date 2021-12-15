import debugFactory from 'debug';
import inherits from 'inherits';
import wpcomFactory from 'wpcom';

const debug = debugFactory( 'calypso:wpcom-oauth-wrapper' );

/**
 * Class inherited from `WPCOMUnpublished` class and adds
 * specific methods useful for wp-calypso.
 *
 * @param {string} [token] - oauth token
 * @param {Function} [reqHandler] - request handler
 * @returns {wpcomFactory} WPCOMOAuthWrapper instance
 */
function WPCOMOAuthWrapper( token, reqHandler ) {
	if ( ! ( this instanceof WPCOMOAuthWrapper ) ) {
		return new WPCOMOAuthWrapper( token, reqHandler );
	}

	if ( 'function' === typeof token ) {
		reqHandler = token;
		token = null;
	} else if ( token ) {
		this.loadToken( token );
	}

	wpcomFactory.call( this, token, function ( params, fn ) {
		if ( this.isTokenLoaded() ) {
			// authToken is used in wpcom-xhr-request,
			// which is used for the signup flow in the REST Proxy
			params = {
				...params,
				authToken: this._token,
				token: this._token,
			};
		}

		return reqHandler( params, fn );
	} );

	debug( 'Extending wpcom with undocumented endpoints.' );
}

inherits( WPCOMOAuthWrapper, wpcomFactory );

/**
 * Add a token to this instance of WPCOM.
 * When loaded, the token is applied to the param object of each subsequent request.
 *
 * @param {string} [token] - oauth token
 */
wpcomFactory.prototype.loadToken = function ( token ) {
	this._token = token;
};

/**
 * Returns a boolean representing whether or not the token has been loaded.
 *
 * @returns {string} oauth token
 */
WPCOMOAuthWrapper.prototype.isTokenLoaded = function () {
	return this._token !== undefined;
};

/**
 * Expose `WPCOMOAuthWrapper`
 */
export default WPCOMOAuthWrapper;
