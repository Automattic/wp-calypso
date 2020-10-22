/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/email-forwarding/init';

/**
 * Retrieve a list of custom mx servers for a particular domainn
 *
 * @param  {object} state    Global state tree
 * @param  {string} domainName domainName to request email forwards for
 * @returns {?Array} mxServers list or null
 */
export default function getEmailForwardingMXServers( state, domainName ) {
	return get( state.emailForwarding, [ domainName, 'mxServers' ], null );
}
