/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites } from 'calypso/my-sites/controller';
import {
	authenticate,
	post,
	redirect,
	siteEditor,
	gutenbergWithoutIframe,
	exitPost,
} from './controller';
import config from 'calypso/config';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { performanceTrackerStart } from 'calypso/lib/performance-tracking/performance-tracker-start';

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
	page( '/post/new', '/post' ); // redirect from beep-beep-boop
	page(
		'/post/:site/:post?',
		siteSelection,
		redirect,
		authenticate,
		post,
		makeLayout,
		clientRender
	);
	page.exit( '/post/:site?/:post?', exitPost );
	page( '/post/:site?', siteSelection, redirect, makeLayout, clientRender );

	page( '/page', siteSelection, sites, makeLayout, clientRender );
	page( '/page/new', '/page' ); // redirect from beep-beep-boop
	page(
		'/without-iframe/post/:site/:post?',
		siteSelection,
		redirect,
		authenticate,
		performanceTrackerStart( 'without-iframe' ),
		gutenbergWithoutIframe,
		makeLayout,
		clientRender
	);

	page(
		'/page/:site/:post?',
		siteSelection,
		redirect,
		authenticate,
		post,
		makeLayout,
		clientRender
	);

	page.exit( '/page/:site?/:post?', exitPost );
	page( '/page/:site?', siteSelection, redirect, makeLayout, clientRender );

	page(
		'/without-iframe/page/:site/:post?',
		siteSelection,
		redirect,
		authenticate,
		gutenbergWithoutIframe,
		makeLayout,
		clientRender
	);

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

	if ( config.isEnabled( 'manage/custom-post-types' ) ) {
		page( '/block-editor/edit/:customPostType/:site/:post?', ( { params = {} } ) => {
			const { customPostType, site, post: postId } = params;
			if ( postId ) {
				return page.redirect( `/edit/${ customPostType }/${ site }/${ postId }` );
			}

			page.redirect( `/edit/${ customPostType }/${ site }` );
		} );
	}
}
