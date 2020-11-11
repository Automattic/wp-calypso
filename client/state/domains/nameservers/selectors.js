/**
 * Internal dependencies
 */
import { initialDomainState } from './reducer';

export function getNameserversByDomainName( state, domainName ) {
	return state.domains?.nameservers[ domainName ] || initialDomainState;
}
