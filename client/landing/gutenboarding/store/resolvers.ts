/**
 * External dependencies
 */
import { addQueryArgs } from '@wordpress/url';
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { receiveVertical } from './actions';
import { TailParameters } from './types';

export function* getVertical(
	search: TailParameters< typeof import('./selectors').getVertical >[ 0 ]
) {
	const url = addQueryArgs( 'https://public-api.wordpress.com/wpcom/v2/verticals', { search } );

	// @FIXME use generic fetch?
	const verticals = yield apiFetch( { url } );

	return receiveVertical( search, verticals );
}
