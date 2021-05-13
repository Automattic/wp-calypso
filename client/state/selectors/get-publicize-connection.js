/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/sharing/init';

/**
 * Return the connection object accoring to the given connectionId.
 *
 * @param {object} state Global state tree
 * @param {number} connectionId Connection ID
 * @returns {object} post publicize connection
 */
export default function getPublicizeConnection( state, connectionId ) {
	return get( state, [ 'sharing', 'publicize', 'connections', connectionId ], null );
}
