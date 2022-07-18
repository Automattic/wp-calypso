import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import { clearCommentNotices, comment, postComments, redirect, siteComments } from './controller';

export default function () {
	// Site View
	page(
		'/promote/:status(all|pending|approved|spam|trash)/:site',
		siteSelection,
		navigation,
		siteComments,
		makeLayout,
		clientRender
	);

	// Post View
	page(
		'/promote/:status(all|pending|approved|spam|trash)/:site/:post',
		siteSelection,
		navigation,
		postComments,
		makeLayout,
		clientRender
	);

	// Comment View
	page( '/promote/:site/:comment', siteSelection, navigation, comment, makeLayout, clientRender );

	// Redirect
	page(
		'/promote/:status(all|pending|approved|spam|trash)',
		siteSelection,
		sites,
		makeLayout,
		clientRender
	);
	page( '/promote/*', siteSelection, redirect );
	page( '/promote', siteSelection, redirect );

	// Leaving Comment Management
	page.exit( '/promote/*', clearCommentNotices );
}
