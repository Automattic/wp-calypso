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

/**
 * Given a service, returns a flattened array of all possible accounts for the
 * service for which a connection can be created.
 *
 * @param  {Object} state   Global state tree
 * @param  {String} service The name of the service to check
 * @return {Array}          Flattened array of all possible accounts for the service
 */
export function getAvailableExternalAccounts( state, service ) {
	const isConnected = ( keyring_connection_ID, external_ID ) => {
		const siteUserConnectionsForService = getSiteUserConnectionsForService(
			state, getSelectedSiteId( state ), getCurrentUserId( state ), service
		);

		return some( siteUserConnectionsForService, { keyring_connection_ID, external_ID } );
	};

	// Iterate over Keyring connections for this service and generate a
	// flattened array of all accounts, including external users
	return getKeyringConnectionsByName( state, service ).reduce( ( memo, keyringConnection ) =>
		memo.concat( [ {
			name: keyringConnection.external_display || keyringConnection.external_name,
			picture: keyringConnection.external_profile_picture,
			keyringConnectionId: keyringConnection.ID,
			isConnected: isConnected( keyringConnection.ID, keyringConnection.external_ID ),
		} ] )
		.concat( keyringConnection.additional_external_users.map( ( externalUser ) => ( {
			ID: externalUser.external_ID,
			name: externalUser.external_name,
			picture: externalUser.external_profile_picture,
			keyringConnectionId: keyringConnection.ID,
			isConnected: isConnected( keyringConnection.ID, externalUser.external_ID ),
			isExternal: true,
		} ) ) ), [] );
}
