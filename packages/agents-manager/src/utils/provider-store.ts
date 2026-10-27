import { dispatch, select } from '@wordpress/data';

/**
 * Big Sky's data store, for what Big Sky still keeps beside AM: its site
 * metadata copy and its legacy CSS dialog. Both accessors return `undefined`
 * where Big Sky isn't loaded.
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
