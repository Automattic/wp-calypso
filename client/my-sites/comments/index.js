/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { clearCommentNotices, comments, redirect } from './controller';
import config from 'config';
import controller from 'my-sites/controller';

export default function() {
	if ( ! config.isEnabled( 'comments/management' ) ) {
		page( '/stats' );
	}

	if ( config.isEnabled( 'comments/management' ) ) {
		page( '/comments/:status?',
			controller.siteSelection,
			redirect,
			controller.sites
		);

		page( '/comments/:status/:site',
			controller.siteSelection,
			redirect,
			controller.navigation,
			comments
		);

		page.exit( '/comments/*', clearCommentNotices );
	}
}
