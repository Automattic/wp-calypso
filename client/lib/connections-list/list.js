/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:connections-list' ),
	without = require( 'lodash/without' ),
	find = require( 'lodash/find' ),
	map = require( 'lodash/map' ),
	filter = require( 'lodash/filter' ),
	findIndex = require( 'lodash/findIndex' ),
	reject = require( 'lodash/reject' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Emitter = require( 'lib/mixins/emitter' ),
	PopupMonitor = require( 'lib/popup-monitor' );

/**
 * ConnectionsList component
 *
 * @api public
 */
function ConnectionsList() {
	if ( ! ( this instanceof ConnectionsList ) ) {
		return new ConnectionsList();
	}

	this.initialized = false;
	this.keyringData = [];
	this.siteData = [];
}

/**
 * Mixins
 */
Emitter( ConnectionsList.prototype );

/**
 * Get list of connections from current object or trigger fetch on first
 * request or when viewing a different site
 *
 * @param {string} siteId  Optional ID of site for which connections should be
 *                         fetched
 * @param {object} options Optional object to specify fetch parameters (`force`
 *                         to force a refresh, `keyringConnectionId` to filter
 *                         to connections using a specific Keyring connection,
 *                         or `userId` to filter to filter to connections
 *                         available to a specific user)
 * @api public
 */
ConnectionsList.prototype.get = function( siteId, options ) {
	var connections;

	options = options || {};

	// Reset if first call or if forced refresh
	if ( ! this.initialized || options.force ) {
		this.fetchkeyringConnections();
	}

	// When viewing site-specific pages, we also issue a request to the
	// site connections endpoint which includes data unknown to the
	// /me/connection endpoint. Specifically, we want access to the ID property
	// to be able to issue disconnect requests
	if ( siteId && ( this.siteId !== siteId || options.force ) ) {
		this.fetchSiteConnections( siteId );
	}

	// Optionally filter connections by site ID
	if ( siteId ) {
		connections = filter( this.siteData, { site_ID: siteId } );
	} else {
		connections = this.keyringData;
	}

	// Optionally filter connections by Keyring connection ID
	if ( options.keyringConnectionId ) {
		connections = filter( connections, { keyring_connection_ID: options.keyringConnectionId } );
	}

	// Optionally filter connections by user ID
	if ( options.userId ) {
		connections = filter( connections, function( connection ) {
			return connection.shared || connection.keyring_connection_user_ID === options.userId;
		} );
	}

	return connections;
};

/**
 * Add a site connection or array of site connections to the list. Emits a
 * `change` event.
 *
 * @param {connection|array} connections A site connection object or array of
 *                                       site connection objects to add
 * @param {int}              index       An optional index at which to insert
 *                                       the connections
 * @api public
 */
ConnectionsList.prototype.addSiteData = function( connections, index ) {
	connections = Array.isArray( connections ) ? connections : [ connections ];

	// Reset added connections
	connections = connections.map( this.normalizeConnection, this );

	// Merge into data
	if ( index >= 0 ) {
		this.siteData.splice.apply( this.siteData, [ index, 0 ].concat( connections ) );
	} else {
		this.siteData = this.siteData.concat( connections );
	}

	// If site connection, append site IDs to corresponding Keyring connection
	connections.forEach( function( connection ) {
		var keyringConnection = find( this.keyringData, { keyring_connection_ID : connection.keyring_connection_ID } );
		if ( keyringConnection && -1 === keyringConnection.sites.indexOf( connection.site_ID ) ) {
			keyringConnection.sites.push( connection.site_ID );
		}
	}, this );

	this.emit( 'change' );
};

/**
 * Add a Keyring connection or array of Keyring connections to the list. Emits
 * a `change` event.
 *
 * @param {connection|array} connections A Keyring connection object or array
 *                                       of Keyring connection objects to add
 * @param {int}              index       An optional index at which to insert
 *                                       the connections
 * @api public
 */
ConnectionsList.prototype.addKeyringData = function( connections, index ) {
	connections = Array.isArray( connections ) ? connections : [ connections ];

	// Reset added connections
	connections = connections.map( this.normalizeConnection, this );

	// Merge into data
	if ( index >= 0 ) {
		this.keyringData.splice.apply( this.keyringData, [ index, 0 ].concat( connections ) );
	} else {
		this.keyringData = this.keyringData.concat( connections );
	}

	this.emit( 'change' );
};

/**
 * Adds a connection or array of connections to the list. Optionally accepts a
 * site ID if the connections are site connections. Otherwise, the connections
 * are assumed to be Keyring connection objects.
 *
 * @param {connection|array} connections A connection object or array of
 *                                       connection objects to add
 * @param {string}           siteId      Optional ID of site for which
 *                                       connections should be added
 * @api public
 */
ConnectionsList.prototype.add = function( connections, siteId ) {
	if ( siteId ) {
		this.addSiteData( connections );
	} else {
		this.addKeyringData( connections );
	}
};

/**
 * Given a service and optional site, establishes a new connection to the
 * service for the current user.
 *
 * @param {service} service             A service meta response object
 * @param {int}     siteId              An optional site ID
 * @param {int}     keyringConnectionId An optional Keyring connection ID that
 *                                      if provided will be used to create a
 *                                      connection
 * @param {int}     externalUserId      An optional external user ID to create a
 *                                      connection to an external user account
 * @api public
 */
ConnectionsList.prototype.create = function( service, siteId, keyringConnectionId, externalUserId ) {
	var keyringConnections, onConnectionUpdated;

	if ( ! this.initialized ) {
		// If the list isn't initialized, wait for initialization and try again
		this.once( 'change', this.create.bind( this, service, siteId, keyringConnectionId, externalUserId ) );
		return;
	}

	if ( keyringConnectionId ) {
		// Since we have a Keyring connection to work with, we can immediately
		// create or update the connection
		keyringConnections = this.get( siteId, { keyringConnectionId: keyringConnectionId } );

		onConnectionUpdated = function( error, connection ) {
			var connections;

			if ( error || ! connection ) {
				debug( 'error creating ConnectionsList connection', error );
				this.emit( 'create:error' );
				return;
			}

			// Interpret response data as single or set of connections
			if ( connection.connections ) {
				connections = connections.connection;
			} else {
				connections = [ connection ];
			}

			if ( siteId && keyringConnections.length ) {
				// Remove the original connection data where this Keyring
				// connectino was being used, if one existed
				this.siteData = reject( this.siteData, { ID: keyringConnections[ 0 ].ID } );
			}

			this.add( connections, siteId );
			this.emit( 'create:success' );
		}.bind( this );

		if ( siteId && keyringConnections.length ) {
			// If a Keyring connection is already in use by another connection,
			// we should trigger an update. There should only be one connection,
			// so we're correct in using the connection ID from the first
			wpcom.undocumented().updateConnection( siteId, keyringConnections[ 0 ].ID, { external_user_ID: externalUserId || false }, onConnectionUpdated );
		} else {
			wpcom.undocumented().createConnection( keyringConnectionId, siteId, externalUserId, { shared: false }, onConnectionUpdated );
		}
	} else {
		// Redirect user through the connection popup flow
		this.connect( service.connect_URL );
	}
};

/**
 * Given a Keyring connection ID and optional site ID, triggers a refresh of
 * the corresponding Keyring connection. Emits a change event
 *
 * @param {connection} connection A connection object to refresh
 * @api public
 */
ConnectionsList.prototype.refresh = function( connection ) {
	var keyringConnection = find( this.keyringData, {
		keyring_connection_ID: connection.keyring_connection_ID
	} );

	if ( keyringConnection ) {
		this.isRefreshing = true;
		this.connect( keyringConnection.refresh_URL, connection.site_ID, function() {
			var isOkay = !! find( this.keyringData, {
				keyring_connection_ID: keyringConnection.keyring_connection_ID,
				status: 'ok'
			} );

			this.isRefreshing = false;
			this.emit( 'refresh:' + ( isOkay ? 'success' : 'error' ) );
		}.bind( this ) );
	}
};

/**
 * Opens a popup window to perform an external connection using the REST API
 * connect URLs. This will prompt the user to authorize the WordPress.com app
 * with a third-party service. The connection is assumed to be established
 * once the popup window has closed, at which point a forced refresh is made.
 *
 * @param  {string}   url The URL to be used for connecting
 * @param  {function} fn  An optional callback to call once refresh completes
 * @api public
 */
ConnectionsList.prototype.connect = function( url, siteId, fn ) {
	if ( ! this.popupMonitor ) {
		this.popupMonitor = new PopupMonitor();
	}

	this.popupMonitor.open( url, null, 'toolbar=0,location=0,status=0,menubar=0,' +
		this.popupMonitor.getScreenCenterSpecs( 780, 500 ) );

	this.popupMonitor.once( 'close', function() {
		// When the user has finished authorizing the connection
		// (or otherwise closed the window), force a refresh
		this.get( siteId, { force: true } );

		this.once( 'change', function() {
			this.emit( 'connect' );

			if ( fn ) {
				fn();
			}
		}.bind( this ) );
	}.bind( this ) );
};

/**
 * Remove a site connection or array of site connections from the list. Emits a
 * `change` event.
 *
 * @param {connection|array} connections A site connection object or array of
 *                                       site connection objects to remove
 * @api public
 */
ConnectionsList.prototype.removeSiteData = function( connections ) {
	var connectionsRemoved = [],
		connectionIdsToRemove;

	connections = Array.isArray( connections ) ? connections : [ connections ];
	connectionIdsToRemove = connections.map( function( connection ) {
		return connection.ID;
	} );

	this.siteData = this.siteData.filter( function( connection ) {
		var isToBeRemoved = -1 !== connectionIdsToRemove.indexOf( connection.ID ),
			keyringConnectionIndex;

		if ( isToBeRemoved ) {
			// Determine whether the removal of this site connection would
			// result in the removal of the corresponding Keyring connection,
			// which occurs when all related connections have been removed.
			keyringConnectionIndex = findIndex( this.keyringData, { keyring_connection_ID: connection.keyring_connection_ID } );
			if ( -1 !== keyringConnectionIndex && 1 === this.keyringData[ keyringConnectionIndex ].sites.length ) {
				this.keyringData.splice( keyringConnectionIndex, 1 );
			} else {
				this.keyringData[ keyringConnectionIndex ].sites = without( this.keyringData[ keyringConnectionIndex ].sites, connection.site_ID );
			}

			connectionsRemoved.push( connection );
		}

		return ! isToBeRemoved;
	}, this );

	this.emit( 'change' );
};

/**
 * Remove a Keyring connection or array of Keyring connections from the list.
 * Emits a `change` event.
 *
 * @param {connection|array} connections A Keyring connection object or array
 *                                       of Keyring connection objects to remove
 * @api public
 */
ConnectionsList.prototype.removeKeyringData = function( connections ) {
	var connectionsRemoved = [],
		connectionIdsToRemove;

	connections = Array.isArray( connections ) ? connections : [ connections ];
	connectionIdsToRemove = map( connections, 'keyring_connection_ID' );

	this.keyringData = this.keyringData.filter( function( connection ) {
		var isToBeRemoved = -1 !== connectionIdsToRemove.indexOf( connection.keyring_connection_ID );

		if ( isToBeRemoved ) {
			// Find and remove any site connections which make use of the
			// Keyring connection
			this.siteData = this.siteData.filter( function( siteConnection ) {
				return connection.keyring_connection_ID !== siteConnection.keyring_connection_ID;
			} );

			connectionsRemoved.push( connection );
		}

		return ! isToBeRemoved;
	}, this );

	this.emit( 'change' );
};

/**
 * Removes a connection or array of connections from the list. Optionally
 * accepts a site ID if the connections are site connections. Otherwise, the
 * connections are assumed to be Keyring connection objects.
 *
 * @param {connection|array} connections A connection object or array of
 *                                       connection objects to remove
 * @param {string}           siteId      Optional ID of site for which
 *                                       connections should be removed
 * @api public
 */
ConnectionsList.prototype.remove = function( connections, siteId ) {
	if ( siteId ) {
		this.removeSiteData( connections );
	} else {
		this.removeKeyringData( connections );
	}
};

/**
 * Given a connection or array of connections, triggers a network request to
 * remove the connections from the current user's account.
 *
 * @param {connection} connection The connection to remove
 * @api public
 */
ConnectionsList.prototype.destroy = function( connections ) {
	if ( ! Array.isArray( connections ) ) {
		connections = [ connections ];
	}

	connections.forEach( function( connection ) {
		if ( 'site_ID' in connection ) {
			wpcom.undocumented().deleteSiteConnection( connection.site_ID, connection.ID, function( error, removed ) {
				if ( error && 404 === error.statusCode ) {
					// If the connection cannot be found, we infer that it must
					// have been deleted since the original connections were
					// retrieved, so find and pass along the cached connection
					removed = find( this.siteData, { ID: connection.ID } );
				}

				if ( removed ) {
					this.removeSiteData( removed );
					this.emit( 'destroy:success' );
				} else {
					this.emit( 'destroy:error' );
				}
			}.bind( this ) );
		} else {
			wpcom.undocumented().deletekeyringConnection( connection.keyring_connection_ID, function( error, removed ) {
				if ( error && 404 === error.statusCode ) {
					// As noted above, a "Not Found" error indicates that the
					// connection was deleted in the time since the original
					// connections were retrieved
					removed = find( this.keyringData, { keyring_connection_ID: connection.keyring_connection_ID } );
				}

				if ( removed && removed.ID ) {
					// User connections use keyring_connection_ID as the ID field.
					// `removed` is not a true connection object, but contains the
					// `ID` property for the connection to be removed
					removed = this.normalizeConnection( removed );
				}

				if ( removed ) {
					this.removeKeyringData( removed );
					this.emit( 'destroy:success' );
				} else {
					this.emit( 'destroy:error' );
				}
			}.bind( this ) );
		}
	}, this );
};

/**
 * Given a Publicize connection object or connection ID, triggers a network
 * request to update the connection with the given set of attributes. Note that
 * Keyring connections cannot be updated.
 *
 * @param {object} connection A connection object or connection ID
 * @param {object} attributes An object of connection attributes to update
 */
ConnectionsList.prototype.update = function( connection, attributes ) {
	wpcom.undocumented().updateConnection( connection.site_ID, connection.ID, attributes, function( error, data ) {
		var existingConnectionIndex;

		if ( error ) {
			debug( 'error updating ConnectionsList connection', error );
			this.emit( 'update:error' );
			return;
		}

		// Replace existing data object with the updated object as returned by
		// the REST API response
		existingConnectionIndex = findIndex( this.siteData, { ID: data.ID } );
		this.siteData.splice( existingConnectionIndex, 1 );
		this.addSiteData( data, existingConnectionIndex );
		this.emit( 'update:success' );
	}.bind( this ) );
};

/**
 * Fetch the user's Keyring connections via the WordPress.com REST API
 *
 * @api public
 */
ConnectionsList.prototype.fetchkeyringConnections = function() {
	if ( ! this.fetchingKeyring ) {
		this.fetchingKeyring = true;

		wpcom.undocumented().mekeyringConnections( function( error, data ) {
			this.fetchingKeyring = false;
			this.updateInitialized();

			if ( error ) {
				debug( 'error fetching ConnectionsList Keyring connections from api', error );
				return;
			}

			this.keyringData = this.parse( data );

			// We only want to emit an update if there's no pending site
			// connections request
			if ( ! this.fetchingSite ) {
				this.emit( 'change' );
			}
		}.bind( this ) );
	}
};

/**
 * Fetch a single site's publicize connections via the WordPress.com REST API
 *
 * @api public
 */
ConnectionsList.prototype.fetchSiteConnections = function( siteId ) {
	if ( ! this.fetchingSite || this.siteId !== siteId ) {
		this.fetchingSite = true;
		this.siteId = siteId;

		wpcom.undocumented().siteConnections( siteId, function( error, data ) {
			this.fetchingSite = false;
			this.updateInitialized();
			if ( error ) {
				debug( 'error fetching ConnectionsList site publicize connections from api', error );
				return;
			}

			this.siteData = this.parse( data );

			// We only want to emit an update if there's no pending Keyring
			// connections request
			if ( ! this.fetchingKeyring ) {
				this.emit( 'change' );
			}
		}.bind( this ) );
	}
};

/**
 * Sets the list as initialized if and only if there are no pending requests
 */
ConnectionsList.prototype.updateInitialized = function() {
	if ( ! this.fetchingSite && ! this.fetchingKeyring ) {
		this.initialized = true;
	}
};

/**
 * Parse data returned from the API
 *
 * @param {array} data
 * @return {array} connections
 **/
ConnectionsList.prototype.parse = function( data ) {
	var list = data.connections || [];
	return list.map( this.normalizeConnection, this );
};

/**
 * Given a single connection, normalizes the properties to a consistent set.
 * In the future, this will be normalized at the server response.
 *
 * @param  {connection} connection A connection object to normalize
 */
ConnectionsList.prototype.normalizeConnection = function( connection ) {
	// don't touch read-only connections
	if ( connection.read_only ) {
		return connection;
	}

	if ( connection.ID && ! connection.keyring_connection_ID ) {
		// A connection returned from /me/connections uses the ID field to
		// represent the Keyring connection ID. Since a Publicize connection
		// also uses ID, we should normalize the connection keyring_connection_ID
		connection.keyring_connection_ID = connection.ID;
		delete connection.ID;

		// Normalize user ID to keyring_connection_user_ID
		connection.keyring_connection_user_ID = connection.user_ID;
		delete connection.user_ID;
	}

	if ( ! Array.isArray( connection.sites ) ) {
		// Populate an array of sites, inferring from the connection site_ID
		// if one is set
		connection.sites = [];
		if ( connection.site_ID ) {
			connection.sites.push( connection.site_ID );
		}
	}

	return connection;
};

/**
 * Expose `ConnectionsList`
 */
module.exports = ConnectionsList;
