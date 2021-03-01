/**
 * External dependencies
 */

import { get, find } from 'lodash';

const DISCOVER_BLOG_ID = 53424024;

/**
 * Add discover properties to a post
 *
 * @param  {object} post - the post to extend
 * @returns {object}      - the post with discover properties
 */
export default function ( post ) {
	const isDiscover = !! (
		get( post, 'discover_metadata' ) || DISCOVER_BLOG_ID === get( post, 'site_ID' )
	);
	let discoverFormat;

	if ( isDiscover ) {
		const formats = get( post, 'discover_metadata.discover_fp_post_formats' );
		const pickFormat = find( formats, ( format ) => format.slug !== 'pick' );

		// if there is no pick format the post is a discover feature
		discoverFormat = pickFormat ? pickFormat.slug : 'feature';
	}

	post.is_discover = isDiscover;
	post.discover_format = discoverFormat;

	return post;
}
