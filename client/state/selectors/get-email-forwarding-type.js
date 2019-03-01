/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieve the type of the email forwards
 *
 * @param  {Object} state    Global state tree
 * @param  {String} domainName domainName to request email forwards for
 * @return {Object}          EmailForwards list
 */
export default function getEmailForwardingType( state, domainName ) {
	return get( state.emailForwarding, [ domainName, 'type' ], null );
}
