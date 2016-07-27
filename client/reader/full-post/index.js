/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { resetTitle, blogPost, blogPostNew, feedPost, feedPostNew } from './controller';
import readerController from 'reader/controller';
import pageNotifier from 'lib/route/page-notifier';
import { hideReaderFullPost } from 'state/ui/reader/fullpost/actions';

export default function() {
	// Listen for route changes and remove the full post dialog when we navigate away from it
	pageNotifier( function removeFullPostOnLeave( newContext, oldContext ) {
		const fullPostViewRegex = /^\/read\/(blogs|feeds)\/([0-9]+)\/posts\/([0-9]+)$/i;

		if (
			( ! oldContext || oldContext.path.match( fullPostViewRegex ) ) &&
			! newContext.path.match( fullPostViewRegex ) ) {
			newContext.store.dispatch( hideReaderFullPost() );
		}
	} );

	// Feed full post
	page( '/read/post/feed/:feed_id/:post_id', readerController.legacyRedirects );
	page( '/read/feeds/:feed/posts/:post',
		readerController.updateLastRoute,
		config.isEnabled( 'reader/refresh-2016-07' ) ? readerController.unmountSidebar : readerController.sidebar,
		config.isEnabled( 'reader/refresh-2016-07' ) ? feedPostNew : feedPost );
	page.exit( '/read/feeds/:feed/posts/:post', resetTitle );

	// Blog full post
	page( '/read/post/id/:blog_id/:post_id', readerController.legacyRedirects );
	page( '/read/blogs/:blog/posts/:post',
		readerController.updateLastRoute,
		config.isEnabled( 'reader/refresh-2016-07' ) ? readerController.unmountSidebar : readerController.sidebar,
		config.isEnabled( 'reader/refresh-2016-07' ) ? blogPostNew : blogPost );
	page.exit( '/read/blogs/:blog/posts/:post', resetTitle );
}
