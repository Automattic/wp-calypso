/**
 * External dependencies
 */
import { addQueryArgs } from '@wordpress/url';
import { apiFetch, dispatch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import { TailParameters } from './types';

export function* getVertical(
	search: TailParameters< typeof import('./selectors').getVertical >[ 0 ]
) {
	const url = addQueryArgs( 'https://public-api.wordpress.com/wpcom/v2/verticals', { search } );

	// @FIXME use generic fetch?
	const verticals = yield apiFetch( { url } );

	// @FIXME Why doesn't `yield receiveVertical( search, verticals );` work?
	yield dispatch( STORE_KEY, 'receiveVertical', search, verticals );
}
