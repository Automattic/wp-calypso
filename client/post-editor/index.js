/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites } from 'my-sites/controller';
import { exitPost, gutenberg, post, pressThis } from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/post', pressThis, siteSelection, sites, makeLayout, clientRender );
	page( '/post/new', () => page.redirect( '/post' ) ); // redirect from beep-beep-boop
	page( '/post/:site?/:post?', siteSelection, gutenberg, post, makeLayout, clientRender );
	page.exit( '/post/:site?/:post?', exitPost );

	page( '/page', siteSelection, sites, makeLayout, clientRender );
	page( '/page/new', () => page.redirect( '/page' ) ); // redirect from beep-beep-boop
	page( '/page/:site?/:post?', siteSelection, gutenberg, post, makeLayout, clientRender );
	page.exit( '/page/:site?/:post?', exitPost );

	if ( config.isEnabled( 'manage/custom-post-types' ) ) {
		page( '/edit/:type', siteSelection, sites, makeLayout, clientRender );
		page( '/edit/:type/new', context => page.redirect( `/edit/${ context.params.type }` ) );
		page( '/edit/:type/:site?/:post?', siteSelection, gutenberg, post, makeLayout, clientRender );
		page.exit( '/edit/:type/:site?/:post?', exitPost );
	}
}
