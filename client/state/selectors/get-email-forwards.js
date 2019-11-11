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
export function getEmailForwards( state, domainName ) {
	return get( state.emailForwarding, [ domainName, 'forwards' ], null );
}

/**
 * Retrieve a list domains that have forwards
 *
 * @param  {Object} state   Global state tree
 * @param  {String} domains domains to filter
 * @return {Array}          list of domains with forwards
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
