/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieve a list of email forwards for a particular domain
 *
 * @param  {Object} state    Global state tree
 * @param  {String} domainName domainName to request email forwards for
 * @return {Object}          EmailForwards list
 */
export default function getEmailForwards( state, domainName ) {
	return get( state.emailForwarding, [ domainName, 'forwards' ], null );
}
