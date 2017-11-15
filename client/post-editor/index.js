/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites } from 'my-sites/controller';
import controller from './controller';
import config from 'config';

export default function() {
	page( '/post', controller.pressThis, siteSelection, sites );
	page( '/post/new', () => page.redirect( '/post' ) ); // redirect from beep-beep-boop
	page( '/post/:site?/:post?', siteSelection, controller.post );
	page.exit( '/post/:site?/:post?', controller.exitPost );

	page( '/page', siteSelection, sites );
	page( '/page/new', () => page.redirect( '/page' ) ); // redirect from beep-beep-boop
	page( '/page/:site?/:post?', siteSelection, controller.post );
	page.exit( '/page/:site?/:post?', controller.exitPost );

	if ( config.isEnabled( 'manage/custom-post-types' ) ) {
		page( '/edit/:type', siteSelection, sites );
		page( '/edit/:type/new', context => page.redirect( `/edit/${ context.params.type }` ) );
		page( '/edit/:type/:site?/:post?', siteSelection, controller.post );
		page.exit( '/edit/:type/:site?/:post?', controller.exitPost );
	}
}
