/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { blogPost, feedPost } from './controller';
import { makeLayout, updateLastRoute, unmountSidebar } from 'reader/controller';
import { render as clientRender } from 'controller';
import { setSection } from 'controller/shared';
import { READER_FULL_POST_DEFINITION } from 'reader';

export default function() {
	// Feed full post
	page(
		'/read/feeds/:feed/posts/:post',
		updateLastRoute,
		unmountSidebar,
		setSection( READER_FULL_POST_DEFINITION ),
		feedPost,
		makeLayout,
		clientRender
	);

	// Blog full post
	page(
		'/read/blogs/:blog/posts/:post',
		updateLastRoute,
		unmountSidebar,
		setSection( READER_FULL_POST_DEFINITION ),
		blogPost,
		makeLayout,
		clientRender
	);
}
