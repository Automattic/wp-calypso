/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/email-forwarding/init';

/**
 * Retrieve the type of the email forwards
 *
 * @param  {object} state    Global state tree
 * @param  {string} domainName domainName to request email forwards for
 * @returns {?string} the string type of the email forwards or null if it has not be retrieved yet
 */
export default function getEmailForwardingType( state, domainName ) {
	return get( state.emailForwarding, [ domainName, 'type' ], null );
}
