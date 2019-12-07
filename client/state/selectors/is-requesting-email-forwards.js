/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 *
 * @param  {Object} state  Global state tree
 * @param  {String} domainName the domain name of the forwards
 * @return {Boolean} If the request is in progress
 */
export default function isRequestingEmailForwards( state, domainName ) {
	return get( state.emailForwarding, [ domainName, 'requesting' ], false );
}
