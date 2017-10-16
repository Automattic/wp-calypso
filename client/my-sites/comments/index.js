/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites, navigation } from 'my-sites/controller';
import { clearCommentNotices, comments, redirect } from './controller';
import config from 'config';

export default function() {
	if ( ! config.isEnabled( 'comments/management' ) ) {
		page( '/stats' );
	}

	if ( config.isEnabled( 'comments/management' ) ) {
		page( '/comments/:status?', siteSelection, redirect, sites );

		page( '/comments/:status/:site', siteSelection, redirect, navigation, comments );

		page.exit( '/comments/*', clearCommentNotices );
	}
}
