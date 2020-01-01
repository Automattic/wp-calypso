/**
 * Internal dependencies
 */

import { MediaTypes } from '../constants';

/**
 * Given an unknown media object, returns an object with empty attributes.
 *
 * @return {object} Normalized object with empty attributes
 */
export function deserialize() {
	return {
		type: MediaTypes.UNKNOWN,
		media: {},
		appearance: {},
	};
}
