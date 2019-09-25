/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getEmailForwards } from 'state/selectors/get-email-forwards';

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
 * Retrieve the type of the email forwards for domains
 *
 * @param  {Object} state    Global state tree
 * @param  {Array}  domains domains to filter
 * @param  {boolean} setPending set forward type to `pending` while waiting for a request to complete.
 * @return {Object} an object containing the email forward type per domain. The type per domain could be null if it has not be retrieved yet
 */
export function getEmailForwardingTypeForDomains( state, domains, setPending = false ) {
	return Object.fromEntries(
		domains.map( domain => {
			const requesting =
				get( state.emailForwarding, [ domain.name, 'requesting' ], false ) === true;
			let type =
				setPending && requesting ? 'pending' : getEmailForwardingType( state, domain.name );
			const forwards = getEmailForwards( state, domain.name );
			type = 'forward' === type && 0 === forwards.length ? null : type;
			return [ domain.name, type ];
		} )
	);
}
