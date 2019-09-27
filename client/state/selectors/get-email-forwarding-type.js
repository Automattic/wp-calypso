/** @format */

/**
 * External dependencies
 */
import { get, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { getEmailForwards } from 'state/selectors/get-email-forwards';
import isRequestingEmailForwards from 'state/selectors/is-requesting-email-forwards';

/**
 * Retrieve the type of the email forwards
 *
 * @param  {Object} state    Global state tree
 * @param  {string} domainName domainName to request email forwards for
 * @return {?string} the string type of the email forwards or null if it has not be retrieved yet
 */
export default function getEmailForwardingType( state, domainName ) {
	return get( state.emailForwarding, [ domainName, 'type' ], null );
}

/**
 * Retrieve the type of the email associated with a domain name
 *
 * @param  {Object} state    Global state tree
 * @param  {String}  domainName domains name to query
 * @return {String} the email type for the domain. It's set as `pending` if it has not been retrieved yet
 */
export function getEmailTypeForDomainName( state, domainName ) {
	// Set the type to `pending` if `requesting`
	let type = isRequestingEmailForwards( state, domainName )
		? 'pending'
		: getEmailForwardingType( state, domainName );
	const forwards = getEmailForwards( state, domainName );
	// Explicitly set the type to null if type === `forward` but there are no active forwards
	if ( 'forward' === type ) {
		type = isEmpty( forwards ) ? null : type;
	}
	return type;
}
