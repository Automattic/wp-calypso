/**
 * Internal dependencies
 */
import { addQueryArgs } from 'calypso/lib/url';
import { getSitePost } from 'calypso/state/posts/selectors/get-site-post';
import { getSite } from 'calypso/state/sites/selectors';

import 'calypso/state/posts/init';

/**
 * Returns the most reliable preview URL for the post by site ID, post ID pair,
 * or null if a preview URL cannot be determined.
 *
 * @param   {object}  state     Global state tree
 * @param   {number}  siteId    Site ID
 * @param   {number}  postId    Post ID
 * @param   {object}  [options] Special options. See wp-calypso#14456
 * @returns {?string}           Post preview URL
 */
export function getPostPreviewUrl( state, siteId, postId, options = false ) {
	const rawPost = options.__forceUseRawPost;
	const shouldUseRawPost = !! rawPost;

	const post = shouldUseRawPost ? rawPost : getSitePost( state, siteId, postId );

	if ( ! post ) {
		return null;
	}

	const { URL: url, status } = post;
	if ( ! url || status === 'trash' ) {
		return null;
	}

	if ( post.preview_URL ) {
		return post.preview_URL;
	}

	let previewUrl = url;
	if ( 'publish' !== status ) {
		previewUrl = addQueryArgs(
			{
				preview: true,
			},
			previewUrl
		);
	}

	// Support mapped domains https
	const site = getSite( state, siteId );
	if ( site && site.options ) {
		const { is_mapped_domain, unmapped_url } = site.options;
		previewUrl = is_mapped_domain ? previewUrl.replace( site.URL, unmapped_url ) : previewUrl;
	}

	return previewUrl;
}
