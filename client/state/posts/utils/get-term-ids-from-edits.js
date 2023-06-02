import { isEmpty, map, mapValues, reduce } from 'lodash';

/**
 * Takes existing term post edits and updates the `terms_by_id` attribute
 *
 * @param  {Object}    post  object of post edits
 * @returns {Object}          normalized post edits
 */
export function getTermIdsFromEdits( post ) {
	if ( ! post || ! post.terms ) {
		return post;
	}

	// Filter taxonomies that are set as arrays ( i.e. tags )
	// This can be detected by an array of strings vs an array of objects
	const taxonomies = reduce(
		post.terms,
		( prev, taxonomyTerms, taxonomyName ) => {
			// Ensures we are working with an array
			const termsArray = Object.values( taxonomyTerms );
			if (
				termsArray &&
				termsArray.length &&
				! ( typeof termsArray[ 0 ] === 'object' && termsArray[ 0 ] !== null )
			) {
				return prev;
			}

			prev[ taxonomyName ] = termsArray;
			return prev;
		},
		{}
	);

	if ( isEmpty( taxonomies ) ) {
		return post;
	}

	return {
		...post,
		terms_by_id: mapValues( taxonomies, ( taxonomy ) => {
			const termIds = map( taxonomy, 'ID' );

			// Hack: qs omits empty arrays in wpcom.js request, which prevents
			// removing all terms for a given taxonomy since the empty array is not sent to the API
			return termIds.length ? termIds : null;
		} ),
	};
}
