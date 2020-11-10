/**
 * Internal dependencies
 */
import { initialDomainState } from './reducer';

export function getByDomainName( state, domainName ) {
	return state.domains?.nameservers[ domainName ] || initialDomainState;
}
