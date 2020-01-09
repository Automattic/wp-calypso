/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { receiveUser } from './actions';

export function* getUser() {
	const url = 'https://public-api.wordpress.com/rest/v1.1/me';
	const user = yield apiFetch( { url } );

	return receiveUser( user );
}
