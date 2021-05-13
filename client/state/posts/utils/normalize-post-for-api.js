/**
 * Internal dependencies
 */
import { normalizeTermsForApi } from 'calypso/state/posts/utils/normalize-terms-for-api';

/**
 * Returns a normalized post object for sending to the API
 *
 * @param  {object} post Raw post object
 * @returns {object}      Normalized post object
 */
export function normalizePostForApi( post ) {
	if ( ! post ) {
		return null;
	}

	return normalizeTermsForApi( post );
}
