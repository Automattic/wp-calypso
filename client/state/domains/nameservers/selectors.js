/**
 * Internal dependencies
 */
import initialDomainState from './initial';

export function getNameserversByDomainName( state, domainName ) {
	return state.domains?.nameservers[ domainName ] || initialDomainState;
}
