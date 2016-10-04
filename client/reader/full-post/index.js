/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { abtest } from 'lib/abtest';
import { resetTitle, blogPost, blogPostNew, feedPost, feedPostNew } from './controller';
import readerController from 'reader/controller';
import pageNotifier from 'lib/route/page-notifier';
import { hideReaderFullPost } from 'state/ui/reader/fullpost/actions';

let useRefresh = null;

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

	if ( useRefresh === null ) {
		useRefresh = config.isEnabled( 'reader/refresh/force-full-post' ) ||
			( config.isEnabled( 'reader/refresh/full-post-ab-test' ) && abtest( 'readerFullPost' ) === 'refreshed' );
	}

	// Feed full post
	page( '/read/post/feed/:feed_id/:post_id', readerController.legacyRedirects );
	page( '/read/feeds/:feed/posts/:post',
		readerController.updateLastRoute,
		useRefresh ? readerController.unmountSidebar : readerController.sidebar,
		useRefresh ? feedPostNew : feedPost );
	page.exit( '/read/feeds/:feed/posts/:post', resetTitle );

	// Blog full post
	page( '/read/post/id/:blog_id/:post_id', readerController.legacyRedirects );
	page( '/read/blogs/:blog/posts/:post',
		readerController.updateLastRoute,
		useRefresh ? readerController.unmountSidebar : readerController.sidebar,
		useRefresh ? blogPostNew : blogPost );
	page.exit( '/read/blogs/:blog/posts/:post', resetTitle );
}
