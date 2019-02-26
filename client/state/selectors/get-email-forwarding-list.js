/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * TODO: Description
 *
 * @param  {Object} state    Global state tree
 * @param  {String} domainName domainName to request email forwards for
 * @return {Object}          EmailForwards list
 */
export default function getEmailForwardingList( state, domainName ) {
	return get( state.emailForwarding, [ domainName, 'forwards' ], null );
}
