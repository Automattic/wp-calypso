/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, navigation, sites } from 'my-sites/controller';
import { clearCommentNotices, comment, postComments, redirect, siteComments } from './controller';
import config from 'config';

export default function() {
	if ( ! config.isEnabled( 'comments/management' ) ) {
		page( '/stats' );
	}

	if ( config.isEnabled( 'comments/management' ) ) {
		// Site View
		page(
			'/comments/:status(all|pending|approved|spam|trash)/:site',
			siteSelection,
			navigation,
			siteComments
		);

		// Post View
		if ( config.isEnabled( 'comments/management/post-view' ) ) {
			page(
				'/comments/:status(all|pending|approved|spam|trash)/:site/:post',
				siteSelection,
				navigation,
				postComments
			);
		}

		// Comment View
		if ( config.isEnabled( 'comments/management/comment-view' ) ) {
			page( '/comment/:site/:comment', siteSelection, navigation, comment );
		}

		// Redirect
		page( '/comments/:status(all|pending|approved|spam|trash)', siteSelection, sites );
		page( '/comments/*', siteSelection, redirect );
		page( '/comments', siteSelection, redirect );
		page( '/comment/*', siteSelection, redirect );
		page( '/comment', siteSelection, redirect );

		// Leaving Comment Management
		page.exit( '/comments/*', clearCommentNotices );
		page.exit( '/comment/*', clearCommentNotices );
	}
}
