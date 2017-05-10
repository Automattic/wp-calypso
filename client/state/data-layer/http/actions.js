/**
 * Internal dependencies
 */
import { HTTP_REQUEST } from 'state/action-types';

export const rawHttp = ( {
	url,
	method,
	headers,
	body,
	withCredentials,
	onSuccess,
	onFailure,
	...options,
}, action = null ) => ( {
	type: HTTP_REQUEST,
	url,
	method,
	headers,
	body,
	withCredentials,
	onSuccess: onSuccess || action,
	onFailure: onFailure || action,
	options,
} );
