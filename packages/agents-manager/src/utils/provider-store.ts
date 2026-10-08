import { dispatch, select } from '@wordpress/data';

/**
 * Big Sky's data store, for the state Big Sky's app keeps beside AM's (its
 * site metadata copy, its legacy CSS dialog). Absent on surfaces without Big
 * Sky, so both accessors answer `undefined` rather than lean on the registry's
 * contract for an unregistered store.
 */
const PROVIDER_STORE = 'ai-assembler';

export function providerSelectors< T >(): T | undefined {
	try {
		return select( PROVIDER_STORE ) as T | undefined;
	} catch {
		return undefined;
	}
}

export function providerActions< T >(): T | undefined {
	try {
		return dispatch( PROVIDER_STORE ) as T | undefined;
	} catch {
		return undefined;
	}
}
