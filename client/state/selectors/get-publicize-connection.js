import { get } from 'lodash';

import 'calypso/state/sharing/init';

/**
 * Return the connection object accoring to the given connectionId.
 *
 * @param {Object} state Global state tree
 * @param {number} connectionId Connection ID
 * @returns {Object} post publicize connection
 */
export default function getPublicizeConnection( state, connectionId ) {
	return get( state, [ 'sharing', 'publicize', 'connections', connectionId ], null );
}
