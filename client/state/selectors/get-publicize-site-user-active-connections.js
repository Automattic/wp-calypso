/* External dependcies */
import { filter } from 'lodash';

/*
 * returns an array of known active connection for the given site ID
 * that are available to the specified user ID.
 *
 * @param  {Object} state Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} userId User ID to filter
 * @return {Array}  User connections
 */
export default function getPublicizeSiteUserActiveConnections( state, siteId, userId ) {
	return filter( state.sharing.publicize.connections, ( connection ) => {
		const { site_ID, shared, keyring_connection_user_ID } = connection;
		return site_ID === siteId &&
			( shared || keyring_connection_user_ID === userId ) &&
			connection.status !== 'broken';
	} );
}
