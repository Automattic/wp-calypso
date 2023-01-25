import { pickBy } from 'lodash';

/**
 * Returns a normalized post terms object for sending to the API
 *
 * @param  {Object} post Raw post object
 * @returns {Object}      Normalized post object
 */
export function normalizeTermsForApi( post ) {
	if ( ! post || ! post.terms ) {
		return post;
	}

	return {
		...post,
		terms: pickBy( post.terms, ( terms ) => {
			return terms.length && terms.every( ( term ) => typeof term === 'string' );
		} ),
	};
}
