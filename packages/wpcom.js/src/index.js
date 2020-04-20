/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import Batch from './lib/batch';
import Domain from './lib/domain';
import Domains from './lib/domains';
import Marketing from './lib/marketing';
import Me from './lib/me';
import Pinghub from './lib/util/pinghub';
import Plans from './lib/plans';
import Request from './lib/util/request';
import Site from './lib/site';
import Users from './lib/users';
import sendRequest from './lib/util/send-request';

/**
 * Local module constants
 */
const debug = debugModule( 'wpcom' );
const DEFAULT_ASYNC_TIMEOUT = 30000;

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

/**
 * Return `Marketing` object instance
 *
 * @returns {Marketing} Marketing instance
 */
WPCOM.prototype.marketing = function () {
	return new Marketing( this );
};

/**
 * Return `Me` object instance
 *
 * @returns {Me} Me instance
 */
WPCOM.prototype.me = function () {
	return new Me( this );
};

/**
 * Return `Domains` object instance
 *
 * @returns {Domains} Domains instance
 */
WPCOM.prototype.domains = function () {
	return new Domains( this );
};

/**
 * Return `Domain` object instance
 *
 * @param {string} domainId - domain identifier
 * @returns {Domain} Domain instance
 */
WPCOM.prototype.domain = function ( domainId ) {
	return new Domain( domainId, this );
};

/**
 * Return `Site` object instance
 *
 * @param {string} id - site identifier
 * @returns {Site} Site instance
 */
WPCOM.prototype.site = function ( id ) {
	return new Site( id, this );
};

/**
 * Return `Users` object instance
 *
 * @returns {Users} Users instance
 */
WPCOM.prototype.users = function () {
	return new Users( this );
};

/**
 * Return `Plans` object instance
 *
 * @returns {Plans} Plans instance
 */
WPCOM.prototype.plans = function () {
	return new Plans( this );
};

/**
 * Return `Batch` object instance
 *
 * @returns {Batch} Batch instance
 */
WPCOM.prototype.batch = function () {
	return new Batch( this );
};

/**
 * List Freshly Pressed Posts
 *
 * @param {object} [query] - query object
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
WPCOM.prototype.freshlyPressed = function ( query, fn ) {
	return this.req.get( '/freshly-pressed', query, fn );
};

// Expose send-request
// TODO: use `this.req` instead of this method
WPCOM.prototype.sendRequest = function ( params, query, body, fn ) {
	const msg = 'WARN! Don use `sendRequest() anymore. Use `this.req` method.';

	/* eslint-disable no-console */
	if ( console && console.warn ) {
		console.warn( msg );
	} else {
		console.log( msg );
	}
	/* eslint-enable no-console */

	return sendRequest.call( this, params, query, body, fn );
};

/**
 * Re-export all the class types.
 */
WPCOM.Batch = Batch;
WPCOM.Domain = Domain;
WPCOM.Domains = Domains;
WPCOM.Marketing = Marketing;
WPCOM.Me = Me;
WPCOM.Pinghub = Pinghub;
WPCOM.Plans = Plans;
WPCOM.Request = Request;
WPCOM.Site = Site;
WPCOM.Users = Users;

if ( ! Promise.prototype.timeout ) {
	/**
	 * Returns a new promise with a deadline
	 *
	 * After the timeout interval, the promise will
	 * reject. If the actual promise settles before
	 * the deadline, the timer is cancelled.
	 *
	 * @param {number} delay how many ms to wait
	 * @returns {Promise} promise
	 */
	Promise.prototype.timeout = function ( delay = DEFAULT_ASYNC_TIMEOUT ) {
		let timer;

		const timeout = new Promise( ( resolve, reject ) => {
			timer = setTimeout( () => {
				reject( new Error( 'Action timed out while waiting for response.' ) );
			}, delay );
		} );

		const cancelTimeout = () => {
			clearTimeout( timer );
			return this;
		};

		return Promise.race( [ this.then( cancelTimeout ).catch( cancelTimeout ), timeout ] );
	};
}
