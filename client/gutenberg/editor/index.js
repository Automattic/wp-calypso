/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites } from 'my-sites/controller';
import { authenticate, post, siteEditor } from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	page( '/block-editor', '/block-editor/post' );

	page( '/site-editor/:site?', siteSelection, authenticate, siteEditor, makeLayout, clientRender );

	page( '/block-editor/post', siteSelection, sites, makeLayout, clientRender );
	page(
		'/block-editor/post/:site/:post?',
		siteSelection,
		authenticate,
		post,
		makeLayout,
		clientRender
	);
	page( '/block-editor/post/:site?', siteSelection, makeLayout, clientRender );

	page( '/block-editor/page', siteSelection, sites, makeLayout, clientRender );
	page(
		'/block-editor/page/:site/:post?',
		siteSelection,
		authenticate,
		post,
		makeLayout,
		clientRender
	);
	page( '/block-editor/page/:site?', siteSelection, makeLayout, clientRender );

	if ( config.isEnabled( 'manage/custom-post-types' ) ) {
		page( '/block-editor/edit/:customPostType', siteSelection, sites, makeLayout, clientRender );
		page(
			'/block-editor/edit/:customPostType/:site/:post?',
			siteSelection,
			authenticate,
			post,
			makeLayout,
			clientRender
		);
		page( '/block-editor/edit/:customPostType/:site?', siteSelection, makeLayout, clientRender );
	}

	page( '/block-editor/*/*', '/block-editor/post' );
	page( '/block-editor/:site', ( context ) =>
		page.redirect( `/block-editor/post/${ context.params.site }` )
	);
}
