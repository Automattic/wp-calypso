/**
 * External dependencies
 */
var some = require( 'lodash/collection/some' ),
	flatten = require( 'lodash/array/flatten' ),
	filter = require( 'lodash/collection/filter' ),
	uniq = require( 'lodash/array/uniq' );

/**
 * Internal dependencies
 */
var connectionsList = require( 'lib/connections-list' )(),
	sites = require( 'lib/sites-list' )(),
	user = require( 'lib/user' )(),
	services = require( './services' );

module.exports = {
	/**
	 * Given a service name and an array of connections, returns true if any
	 * connections in the array are for the given service, or false otherwise.
	 *
	 * @param {string} serviceName The name of the service to check
	 * @param {array}  connections An array of connections to check for the service
	 */
	isServiceInConnections: function( serviceName, connections ) {
		var isInConnections = Array.isArray( connections ) && some( connections, {
			service: serviceName
		} );

		return this.filter( 'isServiceInConnections', serviceName, isInConnections, arguments );
	},

	/**
	 * Given a Keyring connection ID, external user ID, and an array of
	 * Publicize connections, returns true if a Publicize connection exists for
	 * the user, or false otherwise.
	 *
	 * @param  {int}    keyringConnectionId The Keyring connection ID to check
	 * @param  {string} externalUserId      The external user ID to check
	 * @param  {array}  connections         An array of Publicize connections
	 *                                      to check for the external user ID
	 */
	isExternalUserInConnections: function( keyringConnectionId, externalUserId, connections ) {
		return some( connections, {
			keyring_connection_ID: keyringConnectionId,
			external_ID: externalUserId
		} );
	},

	/**
	 * Given a service name, returns true if the service is intended for usage
	 * with the Publicize feature, or false otherwise.
	 *
	 * @param {string} serviceName The name of the service to check
	 */
	isServiceForPublicize: function( serviceName ) {
		// This depends on non-Publicize services providing a filter override
		// to set the value to false. It also duplicates data from the REST API
		// /meta/external-services endpoint, but avoids an additional request.
		return this.filter( 'isServiceForPublicize', serviceName, true, arguments );
	},

	/**
	 * Given a service name, returns true if the service allows multiple
	 * connections to be created for a single site, or false otherwise.
	 *
	 * @param {string} serviceName The name of the service to check
	 */
	supportsMultipleConnectionsPerSite: function( serviceName ) {
		var supportsMultipleConnections = this.isServiceForPublicize( serviceName );

		return this.filter( 'supportsMultipleConnectionsPerSite', serviceName, supportsMultipleConnections, arguments );
	},

	/**
	 * Given a service name and optional site ID, returns true if a connection
	 * exists for the given service, or false otherwise.
	 *
	 * @param {string} serviceName The name of the service to check
	 * @param {int}    siteId      An optional site ID
	 */
	isServiceConnected: function( serviceName, siteId ) {
		var currentUser = user.get(),
			isConnected;

		// Find site ID if one is selected but not provided
		if ( ! siteId && sites.selected ) {
			siteId = sites.getSelectedSite().ID;
		}

		isConnected = currentUser && this.isServiceInConnections( serviceName, this.getConnections( serviceName, siteId ) );

		return this.filter( 'isServiceConnected', serviceName, isConnected, arguments );
	},

	/**
	 * Returns true if a pending request is being made to retrieve accounts for
	 * the current user, or false otherwise.
	 */
	isFetchingAccounts: function() {
		return ! connectionsList.initialized;
	},

	/**
	 * Given a service name and optional site ID, returns the current status of the
	 * service's connection.
	 *
	 * @param {string} serviceName The name of the service to check
	 * @param {int}    siteId      An optional site ID
	 */
	getConnectionStatus: function( serviceName, siteId ) {
		var status;

		// Find site ID if one is selected but not provided
		if ( ! siteId && sites.selected ) {
			siteId = sites.getSelectedSite().ID;
		}

		if ( this.isFetchingAccounts() ) {
			// When connections are still loading, we don't know the status
			status = 'unknown';
		} else if ( ! this.isServiceConnected( serviceName, siteId ) ) {
			// If no connections exist, the service isn't connected
			status = 'not-connected';
		} else if ( some( this.getConnections( serviceName, siteId ), {
				status: 'broken', keyring_connection_user_ID: user.get().ID } ) ) {
			// A problematic connection exists
			status = 'reconnect';
		} else {
			// If all else passes, assume service is connected
			status = 'connected';
		}


		return this.filter( 'getConnectionStatus', serviceName, status, arguments );
	},

	/**
	 * Given a service name and array of connection objects, returns the subset
	 * of connections that are available for use by the current user.
	 *
	 * @param  {string} serviceName The name of the service
	 * @param  {Array}  siteId      Connection objects
	 * @return {Array}              Connections available to user
	 */
	getConnectionsAvailableToCurrentUser: function( serviceName, connections ) {
		var currentUser = user.get();

		if ( ! currentUser ) {
			return [];
		}

		return connections.filter( function( connection ) {
			// Only include connections of the specified service, filtered by
			// those owned by the current user or shared.
			return connection.service === serviceName && ( connection.keyring_connection_user_ID === currentUser.ID || connection.shared );
		} );
	},

	/**
	 * Given a service name and optional site ID, returns the available
	 * connections for the current user.
	 *
	 * @param {string} serviceName The name of the service
	 * @param {int}    siteId      An optional site ID
	 */
	getConnections: function( serviceName, siteId ) {
		var currentUser = user.get(),
			connections;

		if ( currentUser ) {
			// Find site ID if one is selected but not provided
			if ( ! siteId && sites.selected ) {
				siteId = sites.getSelectedSite().ID;
			}

			// Reset site ID if this is not a Publicize connection
			if ( ! this.isServiceForPublicize( serviceName ) ) {
				siteId = null;
			}

			connections = connectionsList.get( siteId );
			connections = this.getConnectionsAvailableToCurrentUser( serviceName, connections );
		} else {
			connections = [];
		}

		return this.filter( 'getConnections', serviceName, connections, arguments );
	},

	/**
	 * Given an array of connections returns the ID and label of unique services
	 * present within those connections
	 *
	 * @param {array} connections An array of connections
	 */
	getServicesFromConnections: function( connections ) {
		return uniq( connections.map( function( connection ) {
			return {
				name: connection.service,
				label: connection.label
			};
		} ), 'name' );
	},

	/**
	 * Given a service name and optional site ID, returns the connections for
	 * which the current user is permitted to reconnect.
	 *
	 * @param {string} serviceName The name of the service
	 * @param {int}    siteId      An optional site ID
	 */
	getRefreshableConnections: function( serviceName, siteId ) {
		var connections = this.getConnections( serviceName, siteId ).filter( function( connection ) {
			// A refreshable connection requires that the current user be the
			// owner of the Keyring token associated with the connection
			return 'broken' === connection.status && connection.keyring_connection_user_ID === user.get().ID;
		}, this );

		return this.filter( 'getRefreshableConnections', serviceName, connections, arguments );
	},

	/**
	 * Given a service name and optional site ID, returns the connections for
	 * which the current user is permitted to remove.
	 *
	 * @param {string} serviceName The name of the service
	 * @param {int}    siteId      An optional site ID
	 */
	getRemovableConnections: function( serviceName, siteId ) {
		var connections = this.getConnections( serviceName, siteId ).filter( function( connection ) {
			return this.canCurrentUserPerformActionOnConnection( 'delete', connection, siteId );
		}, this );

		return this.filter( 'getRemovableConnections', serviceName, connections, arguments );
	},

	/**
	 * Given an array of connection objects which are desired to be destroyed,
	 * returns a filtered set of connection objects to be destroyed. This
	 * enables service-specific handlers to react to destroy events.
	 *
	 * @param {Array|Object} connections A connection or array of connections
	 * @param {int}          siteId      An optional site ID
	 */
	filterConnectionsToRemove: function( connections, siteId ) {
		if ( ! Array.isArray( connections ) ) {
			connections = [ connections ];
		}

		return connections.filter( function( connection ) {
			return this.filterConnectionToRemove( connection, siteId );
		}, this );
	},

	/**
	 * Given an connection object which is desired to be destroyed, returns
	 * true if the connection is to be destroyed, or false otherwise. This
	 * enables service-specific handlers to react to destroy events.
	 *
	 * @param {Object} connection A connection object
	 * @param {int}    siteId     An optional site ID
	 */
	filterConnectionToRemove: function( connection, siteId ) { // eslint-disable-line no-unused-vars
		return this.filter( 'filterConnectionToRemove', connection.service, true, arguments );
	},

	/**
	 * Given a connection object, action, and optional site ID, returns true if
	 * the current user is permitted to take the specified action.
	 *
	 * @param {string} action     An action to be taken (`update` or `delete`)
	 * @param {string} connection The connection object to check
	 * @param {int}    siteId     An optional site ID
	 */
	canCurrentUserPerformActionOnConnection: function( action, connection, siteId ) {
		var currentUser = user.get(),
			site;

		// Find site ID if one is selected but not provided
		if ( ! siteId && sites.selected ) {
			siteId = sites.getSelectedSite().ID;
		}

		site = sites.getSite( siteId );
		if ( site.capabilities && site.capabilities.edit_others_posts ) {
			// Users with the `edit_others_posts` capability can take all
			// actions toward a connection
			return true;
		} else {
			// When user has `publish_posts`, only return true if deleting and
			// if the connection is owned by the user
			return currentUser && 'delete' === action && connection.user_ID === currentUser.ID;
		}
	},

	/**
	 * Given a service, returns a flattened array of all possible accounts for the
	 * service for which a connection can be created.
	 *
	 * @param {string} serviceName The name of the service to check
	 * @param {int}    siteId      An optional site ID
	 */
	getAvailableExternalAccounts: function( serviceName, siteId ) {
		// Find the Keyring connections for this service from the user's
		// Publicize connections
		var keyringConnections = filter( connectionsList.get(), { service: serviceName } ),
			connections = siteId ? connectionsList.get( siteId ) : [],
			accounts;

		// Iterate over Keyring connections for this service and generate a
		// flattened array of all accounts, including external users
		accounts = flatten( keyringConnections.map( function( keyringConnection ) {
			var accounts = [ {
				name: keyringConnection.external_display || keyringConnection.external_name,
				picture: keyringConnection.external_profile_picture,
				keyringConnectionId: keyringConnection.keyring_connection_ID,
				isConnected: this.isExternalUserInConnections( keyringConnection.keyring_connection_ID, keyringConnection.external_ID, connections )
			} ];

			keyringConnection.additional_external_users.forEach( function( externalUser ) {
				accounts.push( {
					ID: externalUser.external_ID,
					name: externalUser.external_name,
					picture: externalUser.external_profile_picture,
					keyringConnectionId: keyringConnection.keyring_connection_ID,
					isConnected: this.isExternalUserInConnections( keyringConnection.keyring_connection_ID, externalUser.external_ID, connections ),
					isExternal: true
				} );
			}, this );

			return accounts;
		}, this ) );

		return this.filter( 'getAvailableExternalAccounts', serviceName, accounts, arguments );
	},

	/**
	 * Given a service name and optional site ID, returns whether the Keyring
	 * authorization attempt succeeded in creating new Keyring account options.
	 *
	 * @param {string} serviceName The name of the service
	 * @param {int}    siteId      An optional site ID
	 */
	didKeyringConnectionSucceed: function( serviceName, siteId ) {
		var availableExternalAccounts = this.getAvailableExternalAccounts( serviceName, siteId ),
			isAnyConnectionOptions = some( availableExternalAccounts, { isConnected: false } );

		if ( ! availableExternalAccounts.length ) {
			// At this point, if there are no available accounts to
			// select, we must assume the user closed the popup
			// before completing the authorization step.
			connectionsList.emit( 'create:error', { cancel: true } );
		} else if ( ! isAnyConnectionOptions ) {
			// Similarly warn user if all options are connected
			connectionsList.emit( 'create:error', { connected: true } );
		}

		return this.filter( 'didKeyringConnectionSucceed', serviceName, availableExternalAccounts.length && isAnyConnectionOptions, arguments );
	},

	/**
	 * Passes value through a service-specific handler if one exists, allowing
	 * for service logic to be performed or the value to be modified.
	 *
	 * @param  {string} functionName      A function name to invoke
	 * @param  {string} serviceName       The name of the service
	 * @param  {*}      value             The value returned by original logic
	 * @param  {object} functionArguments An Array-like arguments object
	 */
	filter: function( functionName, serviceName, value, functionArguments ) {
		if ( serviceName in services && services[ serviceName ][ functionName ] ) {
			return services[ serviceName ][ functionName ].apply( this, [ value ].concat( Array.prototype.slice.call( functionArguments ) ) );
		}

		return value;
	}
};
