/**
 * External dependencies
 */

import { some } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getKeyringConnectionsByName } from './keyring/selectors';
import { getSiteUserConnectionsForService } from './publicize/selectors';
import { getKeyringServiceByName } from './services/selectors';

/**
 * Given a service, returns a flattened array of all possible accounts for the
 * service for which a connection can be created.
 *
 * @param  {object} state       Global state tree
 * @param  {string} serviceName The name of the service to check
 * @returns {Array}              Flattened array of all possible accounts for the service
 */
export function getAvailableExternalAccounts( state, serviceName ) {
	const isConnected = ( keyring_connection_ID, external_ID ) => {
		const siteUserConnectionsForService = getSiteUserConnectionsForService(
			state,
			getSelectedSiteId( state ),
			getCurrentUserId( state ),
			serviceName
		);

		return some( siteUserConnectionsForService, { keyring_connection_ID, external_ID } );
	};

	const service = getKeyringServiceByName( state, serviceName );

	if ( ! service ) {
		return [];
	}

	// Iterate over Keyring connections for this service and generate a
	// flattened array of all accounts, including external users
	return getKeyringConnectionsByName( state, serviceName ).reduce( ( memo, keyringConnection ) => {
		if ( ! service.external_users_only ) {
			memo = memo.concat( [
				{
					ID: keyringConnection.external_ID,
					name: keyringConnection.external_display || keyringConnection.external_name,
					picture: keyringConnection.external_profile_picture,
					keyringConnectionId: keyringConnection.ID,
					isConnected: isConnected( keyringConnection.ID, keyringConnection.external_ID ),
					isExternal: false,
				},
			] );
		}

		return memo.concat(
			keyringConnection.additional_external_users.map( ( externalUser ) => ( {
				ID: externalUser.external_ID,
				name: externalUser.external_name,
				description: externalUser.external_description,
				picture: externalUser.external_profile_picture,
				meta: externalUser.external_meta,
				keyringConnectionId: keyringConnection.ID,
				isConnected: isConnected( keyringConnection.ID, externalUser.external_ID ),
				isExternal: true,
			} ) )
		);
	}, [] );
}

/**
 * Given a service determine if this service should be displayed expanded on /marketing/connections
 *
 * @param {object} state Global state tree
 * @param {object} service The service object to check
 */
export function isServiceExpanded( state, service ) {
	return service.ID === state.sharing.expandedService;
}
