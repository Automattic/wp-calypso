/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieve a list of custom mx servers for a particular domian
 *
 * @param  {Object} state    Global state tree
 * @param  {String} domainName domainName to request email forwards for
 * @return {Object}          EmailForwards list
 */
export default function getEmailForwardingMXServers( state, domainName ) {
	return get( state.emailForwarding, [ domainName, 'mxServers' ], null );
}
