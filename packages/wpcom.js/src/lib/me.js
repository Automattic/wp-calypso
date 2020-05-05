/**
 * Module dependencies
 */
import MeKeyringConnection from './me.keyring-connection';
import MeConnectedApp from './me.connected-application';
import MePublicizeConnection from './me.publicize-connection';
import MeSettings from './me.settings';
import MeTwoStep from './me.two-step';

/**
 * Create `Me` instance
 *
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {null} null
 */
export default function Me( wpcom ) {
	if ( ! ( this instanceof Me ) ) {
		return new Me( wpcom );
	}

	this.wpcom = wpcom;
}

/**
 * Meta data about auth token's User
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Me.prototype.get = function ( query, fn ) {
	return this.wpcom.req.get( '/me', query, fn );
};

/**
 * Get user billing history.
 *
 * @param {object} [query] - query object parameter
 * @param {Function} [fn] - callback function
 * @returns {Function} request handler
 */
Me.prototype.billingHistory = function ( query, fn ) {
	return this.wpcom.req.get( '/me/billing-history', query, fn );
};

/**
 * Get a list of posts of from the user's blogs
 *
 * *Example:*
 *    // Get posts list
 *    wpcom
 *    .me()
 *    .postsList( function( err, data ) {
 *      // posts list data object
 *    } );
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Me.prototype.postsList = function ( query, fn ) {
	return this.wpcom.req.get( '/me/posts', query, fn );
};

/**
 * A list of the current user's sites
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Me.prototype.sites = function ( query, fn ) {
	return this.wpcom.req.get( '/me/sites', query, fn );
};

/**
 * List the currently authorized user's likes
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Me.prototype.likes = function ( query, fn ) {
	return this.wpcom.req.get( '/me/likes', query, fn );
};

/**
 * Get current user's connected applications.
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Me.prototype.connectedApps = function ( query, fn ) {
	return this.wpcom.req.get( '/me/connected-applications', query, fn );
};

/**
 * Get a list of all the keyring connections
 * associated with the current user
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Me.prototype.keyringConnections = function ( query, fn ) {
	return this.wpcom.req.get( '/me/keyring-connections', query, fn );
};

/**
 * Get a list of publicize connections
 * that the current user has set up.
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Me.prototype.publicizeConnections = function ( query, fn ) {
	return this.wpcom.req.get( '/me/publicize-connections', query, fn );
};

/**
 * Return a `MeSettings` instance.
 *
 * @returns {MeSettings} MeSettings instance
 */
Me.prototype.settings = function () {
	return new MeSettings( this.wpcom );
};

/**
 * Return a `MeConnectedApp` instance.
 *
 * @param {string} id - app id
 * @returns {ConnectedApp} Me ConnectedApp instance
 */
Me.prototype.connectedApp = function ( id ) {
	return new MeConnectedApp( id, this.wpcom );
};

/**
 * Return a `MePublicizeConnection` instance.
 *
 * @param {string} id - connection id
 * @returns {MePublicizeConnection} MeSettings instance
 */
Me.prototype.publicizeConnection = function ( id ) {
	return new MePublicizeConnection( id, this.wpcom );
};

/**
 * Return a `MeTwoStep` instance.
 *
 * @returns {MeTwoStep} MeTwoStep instance
 */
Me.prototype.twoStep = function () {
	return new MeTwoStep( this.wpcom );
};

/**
 * Return a `MeKeyringConnection` instance.
 *
 * @param {string} id - connection id
 * @returns {MeKeyringConnection} MeKeyringConnection instance
 */
Me.prototype.keyringConnection = function ( id ) {
	return new MeKeyringConnection( id, this.wpcom );
};
