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
import { VALID_STATUSES } from './constants';

export default function() {
	if ( ! config.isEnabled( 'comments/management' ) ) {
		page( '/stats' );
	}

	if ( config.isEnabled( 'comments/management' ) ) {
		// Site View
		page(
			`/comments/:status(${ VALID_STATUSES.join( '|' ) })/:site`,
			siteSelection,
			navigation,
			siteComments
		);

		// Post View
		page(
			`/comments/:status(${ VALID_STATUSES.join( '|' ) })/:site/:post`,
			siteSelection,
			navigation,
			postComments
		);

		// Comment View
		page( '/comments/:site/:comment', siteSelection, navigation, comment );

		// Redirect
		page( `/comments/:status(${ VALID_STATUSES.join( '|' ) })`, siteSelection, sites );
		page( '/comments/*', siteSelection, redirect );
		page( '/comments', siteSelection, redirect );

		// Leaving Comment Management
		page.exit( '/comments/*', clearCommentNotices );
	}
}
