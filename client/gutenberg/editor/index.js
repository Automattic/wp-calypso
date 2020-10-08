/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites } from 'my-sites/controller';
import { authenticate, post, redirect, siteEditor } from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	page(
		'/site-editor/:site?',
		siteSelection,
		redirect,
		authenticate,
		siteEditor,
		makeLayout,
		clientRender
	);

	page( '/post', siteSelection, sites, makeLayout, clientRender );
	page(
		'/post/:site/:post?',
		siteSelection,
		redirect,
		authenticate,
		post,
		makeLayout,
		clientRender
	);
	page( '/post/:site?', siteSelection, redirect, makeLayout, clientRender );

	page( '/page', siteSelection, sites, makeLayout, clientRender );
	page(
		'/page/:site/:post?',
		siteSelection,
		redirect,
		authenticate,
		post,
		makeLayout,
		clientRender
	);
	page( '/page/:site?', siteSelection, redirect, makeLayout, clientRender );

	if ( config.isEnabled( 'manage/custom-post-types' ) ) {
		page( '/edit/:customPostType', siteSelection, sites, makeLayout, clientRender );
		page(
			'/edit/:customPostType/:site/:post?',
			siteSelection,
			redirect,
			authenticate,
			post,
			makeLayout,
			clientRender
		);
		page( '/edit/:customPostType/:site?', siteSelection, redirect, makeLayout, clientRender );
	}
}
