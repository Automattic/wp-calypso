/**
 * External dependencies
 */
var last = require( 'lodash/last' );

/**
 * Internal dependencies
 */
var connectionsList = require( 'lib/connections-list' )(),
	sites = require( 'lib/sites-list' )();

module.exports = {
	isServiceForPublicize: function() {
		return false;
	},

	getConnections: function( connections, serviceName, siteId ) {
		var site = siteId ? sites.getSite( siteId ) : sites.getSelectedSite();

		if ( ! site || ! site.settings ) {
			return [];
		}

		return connections.filter( function( connection ) {
			return site.settings.eventbrite_api_token === connection.keyring_connection_ID;
		} );
	},

	didKeyringConnectionSucceed: function( value, serviceName, siteId ) {
		var site = siteId ? sites.getSite( siteId ) : sites.getSelectedSite(),
			connection = last( this.getAvailableExternalAccounts( serviceName, siteId ) );

		if ( site && connection ) {
			// Update site setting with Eventbrite token details
			site.saveSettings( {
				eventbrite_api_token: connection.keyringConnectionId
			}, function( error, data ) {
				var success = ! error && Object.keys( data.updated ).length;
				connectionsList.emit( 'create:' + ( success ? 'success' : 'error' ) );
			} );
		}

		return value;
	},

	filterConnectionToRemove: function( shouldDestroy, connection, siteId ) {
		var site = siteId ? sites.getSite( siteId ) : sites.getSelectedSite();

		if ( site ) {
			// Update site setting to remove Eventbrite token details
			site.saveSettings( {
				eventbrite_api_token: ''
			}, function( error, data ) {
				var success = ! error && Object.keys( data.updated ).length;
				connectionsList.emit( 'destroy:' + ( success ? 'success' : 'error' ) );
			} );
		}

		return false;
	}
};
