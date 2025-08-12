import page from '@automattic/calypso-router';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'calypso/controller';
import { siteSelection, sites } from 'calypso/my-sites/controller';
import {
	authenticate,
	redirect,
	exitPost,
	redirectSiteEditor,
	redirectToPermalinkIfLoggedOut,
	redirectPostEditor,
} from './controller';

export default function () {
	page( '/site-editor/:site?', redirectLoggedOut, siteSelection, redirectSiteEditor );
	page( '/post', redirectLoggedOut, siteSelection, sites, makeLayout, clientRender );
	page( '/post/new', '/post' ); // redirect from beep-beep-boop
	page(
		'/post/:site/:post?',
		redirectToPermalinkIfLoggedOut,
		siteSelection,
		redirect,
		authenticate,
		redirectPostEditor
	);
	page.exit( '/post/:site?/:post?', exitPost );
	page( '/post/:site?', redirectLoggedOut, siteSelection, redirect, makeLayout, clientRender );

	page( '/page', redirectLoggedOut, siteSelection, sites, makeLayout, clientRender );
	page( '/page/new', '/page' ); // redirect from beep-beep-boop
	page(
		'/page/:site/:post?',
		redirectToPermalinkIfLoggedOut,
		siteSelection,
		redirect,
		authenticate,
		redirectPostEditor
	);
	page.exit( '/page/:site?/:post?', exitPost );
	page( '/page/:site?', redirectLoggedOut, siteSelection, redirect, makeLayout, clientRender );

	page(
		'/edit/:customPostType',
		redirectLoggedOut,
		siteSelection,
		sites,
		makeLayout,
		clientRender
	);
	page(
		'/edit/:customPostType/:site/:post?',
		redirectToPermalinkIfLoggedOut,
		siteSelection,
		redirect,
		authenticate,
		redirectPostEditor
	);
	page(
		'/edit/:customPostType/:site?',
		redirectLoggedOut,
		siteSelection,
		redirect,
		makeLayout,
		clientRender
	);

	/*
	 * Redirecto the old `/block-editor` routes to the default routes.
	 */
	page( '/block-editor/', '/post' );
	page( '/block-editor/post/', '/post' );
	page( '/block-editor/post/:site/:post?', ( { params = {} } ) => {
		const { site, post: postId } = params;
		if ( postId ) {
			return page.redirect( `/post/${ site }/${ postId }` );
		}
		page.redirect( `/post/${ site }/` );
	} );

	page( '/block-editor/page/', '/page' );
	page( '/block-editor/page/:site/:page?', ( { params = {} } ) => {
		const { site, page: pageId } = params;
		if ( pageId ) {
			return page.redirect( `/page/${ site }/${ pageId }` );
		}
		page.redirect( `/page/${ site }/` );
	} );

	page( '/block-editor/edit/:customPostType/:site/:post?', ( { params = {} } ) => {
		const { customPostType, site, post: postId } = params;
		if ( postId ) {
			return page.redirect( `/edit/${ customPostType }/${ site }/${ postId }` );
		}

		page.redirect( `/edit/${ customPostType }/${ site }` );
	} );
}
