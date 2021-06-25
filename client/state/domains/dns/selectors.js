/**
 * Internal dependencies
 */
import { initialState } from './reducer';

import 'calypso/state/domains/init';

export function getDomainDns( state, domain ) {
	return state.domains.dns[ domain ] || initialState;
}
