import 'calypso/state/email-forwarding/init';

/**
 * Retrieve a list of email forwards for a particular domain
 *
 * @param  {object} state    Global state tree
 * @param  {string} domainName domainName to request email forwards for
 * @returns {object}          EmailForwards list
 */
export function getEmailForwards( state, domainName ) {
	return state?.emailForwarding?.[ domainName ]?.forwards ?? null;
}

/**
 * Determines whether we are in the process of adding a new email forward to the specified domain.
 *
 * @param  {object} state    Global state tree
 * @param  {string} domainName domainName to request email adding forwards state
 * @returns {boolean}          adding forwards
 */
export function isAddingEmailForward( state, domainName ) {
	return state?.emailForwarding?.[ domainName ]?.addingForward ?? null;
}

/**
 * Determines whether adding a new email forward was success or not.
 *
 * @param  {object} state    Global state tree
 * @param  {string} domainName domainName to request email adding forwards state
 * @returns {boolean}          adding forwards
 */
export function addEmailForwardSuccess( state, domainName ) {
	return state?.emailForwarding?.[ domainName ]?.addEmailForwardSuccess ?? false;
}

/**
 * Retrieve a list domains that have forwards
 *
 * @param  {object} state   Global state tree
 * @param  {Array} domains domains to filter
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
