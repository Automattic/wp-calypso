/**
 * External dependencies
 */
import { filter, flatten, some, values } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteUserConnectionsForService } from 'state/sharing/publicize/selectors';

/**
 * Returns an array of keyring connection objects.
 *
 * @param  {Object} state Global state tree
 * @return {Array}        Keyring connections, if known.
 */
export function getKeyringConnections( state ) {
	return values( state.sharing.keyring.items );
}

/**
 * Returns a keyring connection object with a specified ID.
 *
 * @param  {Object} state               Global state tree
 * @param  {Number} keyringConnectionId Keyring connection ID.
 * @return {?Object}                    Keyring connections, if known.
 */
export function getKeyringConnectionById( state, keyringConnectionId ) {
	return state.sharing.keyring.items[ keyringConnectionId ] || null;
}

/**
 * Returns an array of keyring connection objects for a specified service.
 *
 * @param  {Object} state   Global state tree
 * @param  {String} service Service slug.
 * @return {Array}         Keyring connections, if known.
 */
export function getKeyringConnectionsByName( state, service ) {
	return filter( getKeyringConnections( state ), { service } ) || [];
}

/**
 * Returns an array of keyring connection objects for a specific user.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} userId User ID.
 * @return {Array}         Site connections, if known.
 */
export function getUserConnections( state, userId ) {
	return filter( state.sharing.keyring.items, ( connection ) => (
		connection.shared || connection.keyring_connection_user_ID === userId
	) );
}

/**
 * Given a service, returns a flattened array of all possible accounts for the
 * service for which a connection can be created.
 *
 * @param  {Object} state   Global state tree
 * @param  {String} service The name of the service to check
 * @return {Array}          Flattened array of all possible accounts for the service
 */
export function getAvailableExternalConnections( state, service ) {
	const siteUserConnectionsForService = getSiteUserConnectionsForService(
		state, getSelectedSiteId( state ), getCurrentUserId( state ), service
	);

	// Iterate over Keyring connections for this service and generate a
	// flattened array of all accounts, including external users
	return flatten( getKeyringConnectionsByName( state, service ).map( ( keyringConnection ) => {
		const accounts = [ {
			name: keyringConnection.external_display || keyringConnection.external_name,
			picture: keyringConnection.external_profile_picture,
			keyringConnectionId: keyringConnection.ID,
			isConnected: some( siteUserConnectionsForService, {
				keyring_connection_ID: keyringConnection.ID,
				external_ID: keyringConnection.external_ID,
			} ),
		} ];

		keyringConnection.additional_external_users.forEach( ( externalUser ) => {
			accounts.push( {
				ID: externalUser.external_ID,
				name: externalUser.external_name,
				picture: externalUser.external_profile_picture,
				keyringConnectionId: keyringConnection.ID,
				isConnected: some( siteUserConnectionsForService, {
					keyring_connection_ID: keyringConnection.ID,
					external_ID: externalUser.external_ID,
				} ),
				isExternal: true,
			} );
		} );

		return accounts;
	} ) );
}

/**
 * Returns true if a request is in progress to retrieve keyring services,
 * or false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether a request is in progress
 */
export function isKeyringConnectionsFetching( state ) {
	return state.sharing.keyring.isFetching;
}
