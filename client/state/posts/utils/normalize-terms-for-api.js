/**
 * External dependencies
 */
import { pickBy, isString, every } from 'lodash';

/**
 * Returns a normalized post terms object for sending to the API
 *
 * @param  {object} post Raw post object
 * @returns {object}      Normalized post object
 */
export function normalizeTermsForApi( post ) {
	if ( ! post || ! post.terms ) {
		return post;
	}

	return {
		...post,
		terms: pickBy( post.terms, terms => {
			return terms.length && every( terms, isString );
		} ),
	};
}
