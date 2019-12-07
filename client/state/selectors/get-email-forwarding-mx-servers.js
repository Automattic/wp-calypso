/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieve a list of custom mx servers for a particular domainn
 *
 * @param  {Object} state    Global state tree
 * @param  {string} domainName domainName to request email forwards for
 * @return {?Array} mxServers list or null
 */
export default function getEmailForwardingMXServers( state, domainName ) {
	return get( state.emailForwarding, [ domainName, 'mxServers' ], null );
}
