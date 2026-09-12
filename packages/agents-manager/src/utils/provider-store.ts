import { dispatch, select } from '@wordpress/data';

/**
 * Big Sky's data store, read or written where its provider still owns state
 * the agent sees. Absent on surfaces without Big Sky, so both accessors answer
 * `undefined` rather than lean on the registry's contract for an unregistered
 * store. Each use is marked `TODO (ability-migration)`.
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
