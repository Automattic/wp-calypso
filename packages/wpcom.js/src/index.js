import debugModule from 'debug';
import Batch from './lib/batch';
import Domain from './lib/domain';
import Domains from './lib/domains';
import Plans from './lib/plans';
import Site from './lib/site';
import Users from './lib/users';
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
 * @param {string} [token] - OAuth API access token
 * @param {Function} [reqHandler] - function Request Handler
 * @returns {WPCOM|undefined} wpcom instance
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
 * Add a token to this instance of WPCOM.
 * When loaded, the token is applied to the param object of each subsequent request.
 * @param {string} [token] - oauth token
 */
WPCOM.prototype.loadToken = function ( token ) {
	this.token = token;
};

/**
 * Returns a boolean representing whether or not the token has been loaded.
 * @returns {boolean} oauth token
 */
WPCOM.prototype.isTokenLoaded = function () {
	return this.token !== undefined;
};

/**
 * Return `Domains` object instance
 * @returns {Domains} Domains instance
 */
WPCOM.prototype.domains = function () {
	return new Domains( this );
};

/**
 * Return `Domain` object instance
 * @param {string} domainId - domain identifier
 * @returns {Domain} Domain instance
 */
WPCOM.prototype.domain = function ( domainId ) {
	return new Domain( domainId, this );
};

/**
 * Return `Site` object instance
 * @param {string} id - site identifier
 * @returns {Site} Site instance
 */
WPCOM.prototype.site = function ( id ) {
	return new Site( id, this );
};

/**
 * Return `Users` object instance
 * @returns {Users} Users instance
 */
WPCOM.prototype.users = function () {
	return new Users( this );
};

/**
 * Return `Plans` object instance
 * @returns {Plans} Plans instance
 */
WPCOM.prototype.plans = function () {
	return new Plans( this );
};

/**
 * Return `Batch` object instance
 * @returns {Batch} Batch instance
 */
WPCOM.prototype.batch = function () {
	return new Batch( this );
};

/**
 * List Freshly Pressed Posts
 * @param {Object} [query] - query object
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
WPCOM.prototype.freshlyPressed = function ( query, fn ) {
	return this.req.get( '/freshly-pressed', query, fn );
};

/**
 * Re-export all the class types.
 */
WPCOM.Batch = Batch;
WPCOM.Domain = Domain;
WPCOM.Domains = Domains;
WPCOM.Pinghub = Pinghub;
WPCOM.Plans = Plans;
WPCOM.Request = Request;
WPCOM.Site = Site;
WPCOM.Users = Users;
