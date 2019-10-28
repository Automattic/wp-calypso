/**
 * External dependencies
 */
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import * as selectors from './selectors';
import { apiFetch, dispatch } from '@wordpress/data-controls';
import { STORE_KEY } from './constants';

type ResolverParameters< S extends ( state: any, ...args: any ) => any > = S extends (
	state: any,
	...args: infer P
) => any
	? P
	: never;

/**
 * Requests theme supports data from the index.
 */
export function* getVertical(
	...[ search ]: ResolverParameters< typeof selectors[ 'getVertical' ] >
) {
	const url = `https://public-api.wordpress.com/wpcom/v2/verticals${ addQueryArgs( undefined, {
		search,
	} ) }`;
	const verticals = yield apiFetch( { url } );
	yield dispatch( STORE_KEY, 'receiveVertical', search, verticals );
}
