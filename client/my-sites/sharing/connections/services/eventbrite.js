/**
 * External dependencies
 */
import { filter, last } from 'lodash';

/**
 * Internal dependencies
 */
import connectionsList from 'lib/connections-list';
import sites from 'lib/sites-list';

export function getConnections( connections, serviceName, siteId ) {
	const site = siteId ? sites().getSite( siteId ) : sites().getSelectedSite();

	if ( ! site || ! site.settings ) {
		return [];
	}

	return filter( connections, { keyring_connection_ID: site.settings.eventbrite_api_token } );
}

export function didKeyringConnectionSucceed( value, serviceName, siteId, availableExternalConnections ) {
	const site = siteId ? sites().getSite( siteId ) : sites().getSelectedSite(),
		connection = last( availableExternalConnections );

	if ( site && connection ) {
		// Update site setting with Eventbrite token details
		site.saveSettings( {
			eventbrite_api_token: connection.keyringConnectionId
		}, function( error, data ) {
			const success = ! error && Object.keys( data.updated ).length;
			connectionsList().emit( 'create:' + ( success ? 'success' : 'error' ) );
		} );
	}

	return value;
}

export function filterConnectionToRemove( shouldDestroy, connection, siteId ) {
	const site = siteId ? sites().getSite( siteId ) : sites().getSelectedSite();

	if ( site ) {
		// Update site setting to remove Eventbrite token details
		site.saveSettings( {
			eventbrite_api_token: ''
		}, function( error, data ) {
			const success = ! error && Object.keys( data.updated ).length;
			connectionsList().emit( 'destroy:' + ( success ? 'success' : 'error' ) );
		} );
	}

	return false;
}
