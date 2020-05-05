/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, navigation, sites } from 'my-sites/controller';
import { clearCommentNotices, comment, postComments, redirect, siteComments } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	// Site View
	page(
		'/comments/:status(all|pending|approved|spam|trash)/:site',
		siteSelection,
		navigation,
		siteComments,
		makeLayout,
		clientRender
	);

	// Post View
	page(
		'/comments/:status(all|pending|approved|spam|trash)/:site/:post',
		siteSelection,
		navigation,
		postComments,
		makeLayout,
		clientRender
	);

	// Comment View
	page( '/comment/:site/:comment', siteSelection, navigation, comment, makeLayout, clientRender );

	// Redirect
	page(
		'/comments/:status(all|pending|approved|spam|trash)',
		siteSelection,
		sites,
		makeLayout,
		clientRender
	);
	page( '/comments/*', siteSelection, redirect );
	page( '/comments', siteSelection, redirect );
	page( '/comment/*', siteSelection, redirect );
	page( '/comment', siteSelection, redirect );

	// Leaving Comment Management
	page.exit( '/comments/*', clearCommentNotices );
	page.exit( '/comment/*', clearCommentNotices );
}
