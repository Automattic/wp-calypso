import { getTermIdsFromEdits } from 'calypso/state/posts/utils/get-term-ids-from-edits';

/**
 * Given a post object, returns a normalized post object
 *
 * @param  {Object} post Raw edited post object
 * @returns {Object}      Normalized post object
 */
export function normalizePostForEditing( post ) {
	if ( ! post ) {
		return null;
	}

	return getTermIdsFromEdits( post );
}
