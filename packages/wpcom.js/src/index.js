import debugModule from 'debug';
import Pinghub from './lib/util/pinghub';
import Request from './lib/util/request';

/**
 * Local module constants
 */
const debug = debugModule( 'wpcom' );

/**
 * XMLHttpRequest (and CORS) API access method.
 *
 * API authentication is done via an (optional) access `token`,
 * which needs to be retrieved via OAuth.
 *
 * Request Handler is optional and XHR is defined as default.
 *
 * @param {string} [token] - OAuth API access token
 * @param {Function} [reqHandler] - function Request Handler
 * @returns {WPCOM} wpcom instance
 */
export default function WPCOM( token, reqHandler ) {
	if ( ! ( this instanceof WPCOM ) ) {
		return new WPCOM( token, reqHandler );
	}

	// `token` is optional
	if ( 'function' === typeof token ) {
		reqHandler = token;
		token = null;
	}

	if ( token ) {
		debug( 'Token defined: %s…', token.substring( 0, 6 ) );
		this.token = token;
	}

	const noHandler = ( params, fn ) => {
		debug( 'No request handler. Failing.' );
		fn( new Error( 'No request handler provided' ) );
	};

	this.request = reqHandler || noHandler;

	// Add Req instance
	this.req = new Request( this );

	// Add Pinghub instance
	this.pinghub = new Pinghub( this );

	// Default api version;
	this.apiVersion = '1.1';
}
