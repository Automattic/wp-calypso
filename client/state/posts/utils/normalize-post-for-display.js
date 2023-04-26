import config from '@automattic/calypso-config';
import { cloneDeep, flow } from 'lodash';
import detectMedia from 'calypso/lib/post-normalizer/rule-content-detect-media';
import decodeEntities from 'calypso/lib/post-normalizer/rule-decode-entities';
import pickCanonicalImage from 'calypso/lib/post-normalizer/rule-pick-canonical-image';
import stripHtml from 'calypso/lib/post-normalizer/rule-strip-html';
import withContentDom from 'calypso/lib/post-normalizer/rule-with-content-dom';

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
 * @param  {Object} post Raw post object
 * @returns {Object}      Normalized post object
 */
export function normalizePostForDisplay( post ) {
	if ( ! post ) {
		return null;
	}

	let normalizedPost = normalizePostCache.get( post );
	if ( ! normalizedPost ) {
		// `normalizeDisplayFlow` mutates its argument properties -- hence deep clone is needed
		normalizedPost = normalizeDisplayFlow( cloneDeep( post ) );
		if ( config.isEnabled( 'page/export' ) ) {
			// we need the original content from the API to be able to export a page
			normalizedPost.rawContent = post.content;
		}
		normalizePostCache.set( post, normalizedPost );
	}
	return normalizedPost;
}
