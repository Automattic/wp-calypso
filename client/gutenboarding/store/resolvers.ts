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
import { TailParameters } from './types';

export function* getVertical( search: TailParameters< typeof selectors[ 'getVertical' ] >[ 0 ] ) {
	const url = `https://public-api.wordpress.com/wpcom/v2/verticals${ addQueryArgs( undefined, {
		search,
	} ) }`;
	const verticals = yield apiFetch( { url } );
	yield dispatch( STORE_KEY, 'receiveVertical', search, verticals );
}
