/**
 * Internal dependencies
 */
import { initialState } from './reducer';

export function getDomainDns( state, domain ) {
	return state.domains.dns[ domain ] || initialState;
}
