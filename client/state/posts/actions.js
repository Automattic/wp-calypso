/**
 * Internal dependencies
 */
import { POST_RECEIVE } from 'state/action-types';

/**
 * Returns an action object to be used in signalling that a post object has
 * been received.
 *
 * @param  {Object} post Post received
 * @return {Object}      Action object
 */
export function receivePost( post ) {
	return {
		type: POST_RECEIVE,
		post
	};
}
