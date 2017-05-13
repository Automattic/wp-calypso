/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return the connection object accoring to the given connectionId.
 *
 * @param {Object} state Global state tree
 * @param {Number} connectionId Connection ID
 * @return {Object} post publicize connection
 */
export default function getPublicizeConnection( state, connectionId ) {
	return get( state, [ 'sharing', 'publicize', 'connections', connectionId ], null );
}
