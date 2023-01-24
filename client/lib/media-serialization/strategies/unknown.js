import { MediaTypes } from '../constants';

/**
 * Given an unknown media object, returns an object with empty attributes.
 *
 * @returns {Object} Normalized object with empty attributes
 */
export function deserialize() {
	return {
		type: MediaTypes.UNKNOWN,
		media: {},
		appearance: {},
	};
}
