/**
 * Internal dependencies
 */
import { RECEIVE_SITE } from 'state/action-types';

/**
 * Returns an action object to be used in signalling that a site object has
 * been received.
 *
 * @param  {Object} site Site received
 * @return {Object}      Action object
 */
export function receiveSite( site ) {
	return {
		type: RECEIVE_SITE,
		site
	};
}
