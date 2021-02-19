/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/email-forwarding/init';

/**
 * Retrieve a list of email forwards for a particular domain
 *
 * @param  {object} state    Global state tree
 * @param  {string} domainName domainName to request email forwards for
 * @returns {object}          EmailForwards list
 */
export function getEmailForwards( state, domainName ) {
	return get( state.emailForwarding, [ domainName, 'forwards' ], null );
}

/**
 * Retrieve a list domains that have forwards
 *
 * @param  {object} state   Global state tree
 * @param  {string} domains domains to filter
 * @returns {Array}          list of domains with forwards
 */
export function getDomainsWithForwards( state, domains ) {
	if ( ! domains || ! domains.length ) {
		return [];
	}
	return domains.reduce( ( accumulator, domain ) => {
		const forwards = getEmailForwards( state, domain.domain );
		if ( forwards && forwards.length ) {
			accumulator.push( domain.domain );
		}
		return accumulator;
	}, [] );
}
