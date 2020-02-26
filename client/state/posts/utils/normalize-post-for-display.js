/**
 * External dependencies
 */
import { cloneDeep, flow } from 'lodash';

/**
 * Internal dependencies
 */
import pickCanonicalImage from 'lib/post-normalizer/rule-pick-canonical-image';
import decodeEntities from 'lib/post-normalizer/rule-decode-entities';
import detectMedia from 'lib/post-normalizer/rule-content-detect-media';
import withContentDom from 'lib/post-normalizer/rule-with-content-dom';
import stripHtml from 'lib/post-normalizer/rule-strip-html';

const normalizeDisplayFlow = flow( [
	decodeEntities,
	stripHtml,
	withContentDom( [ detectMedia ] ),
	pickCanonicalImage,
] );

/**
 * Memoization cache for `normalizePostForDisplay`. If an identical `post` object was
 * normalized before, retrieve the normalized value from cache instead of recomputing.
 */
const normalizePostCache = new WeakMap();

/**
 * Returns a normalized post object given its raw form. A normalized post
 * includes common transformations to prepare the post for display.
 *
 * @param  {object} post Raw post object
 * @returns {object}      Normalized post object
 */
export function normalizePostForDisplay( post ) {
	if ( ! post ) {
		return null;
	}

	let normalizedPost = normalizePostCache.get( post );
	if ( ! normalizedPost ) {
		// `normalizeDisplayFlow` mutates its argument properties -- hence deep clone is needed
		normalizedPost = normalizeDisplayFlow( cloneDeep( post ) );
		normalizePostCache.set( post, normalizedPost );
	}
	return normalizedPost;
}
