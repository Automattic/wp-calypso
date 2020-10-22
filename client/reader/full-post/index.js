/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { blogPost, feedPost } from './controller';
import { updateLastRoute } from 'reader/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	// Feed full post
	page( '/read/feeds/:feed/posts/:post', updateLastRoute, feedPost, makeLayout, clientRender );

	// Blog full post
	page( '/read/blogs/:blog/posts/:post', updateLastRoute, blogPost, makeLayout, clientRender );
}
