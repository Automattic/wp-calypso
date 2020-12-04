/**
 * External dependencies
 */

import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getKeyringConnectionsByName } from 'calypso/state/sharing/keyring/selectors';
import { getRemovableConnections as getRemovablePublicizeConnections } from 'calypso/state/sharing/publicize/selectors';

/**
 * Given a Keyring service name, returns the connections that the current user is
 * allowed to remove.
 *
 * For them to be allowed to remove a connection they need to have either the
 * `edit_others_posts` capability or it's a connection to one of
 * their accounts.
 *
 * @param   {object} state   Global state tree
 * @param   {string} service The name of the service
 * @returns {Array}          Connections that the current user is allowed to remove
 */
export default function getRemovableConnections( state, service ) {
	const userId = getCurrentUserId( state );
	const keyringConnections = filter(
		getKeyringConnectionsByName( state, service ),
		( { type, user_ID } ) => 'publicize' !== type && user_ID === userId
	);

	return [ ...keyringConnections, ...getRemovablePublicizeConnections( state, service ) ];
}
