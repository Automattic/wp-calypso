/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/email-forwarding/init';

/**
 *
 * @param  {object} state  Global state tree
 * @param  {string} domainName the domain name of the forwards
 * @returns {boolean} If the request is in progress
 */
export default function isRequestingEmailForwards( state, domainName ) {
	return get( state.emailForwarding, [ domainName, 'requesting' ], false );
}
