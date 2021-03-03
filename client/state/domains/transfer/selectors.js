/**
 * Internal dependencies
 */
import initialDomainState from './initial';

export function getDomainWapiInfoByDomainName( state, domainName ) {
	return state.domains?.transfer.items[ domainName ] || initialDomainState;
}
