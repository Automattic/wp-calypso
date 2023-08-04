import { initialStateForDomain } from './reducer';

import 'calypso/state/domains/init';

export function getDomainRedirect( state, domain ) {
	return state.domains.domainRedirect[ domain ] || initialStateForDomain;
}
