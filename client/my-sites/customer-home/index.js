/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import home, { maybeRedirect } from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { trackNavigationStart } from 'lib/performance-tracking';

export default function () {
	page( '/home', trackNavigationStart( 'home' ), siteSelection, sites, makeLayout, clientRender );

	page(
		'/home/:siteId',
		trackNavigationStart( 'home' ),
		siteSelection,
		maybeRedirect,
		navigation,
		home,
		makeLayout,
		clientRender
	);
}
