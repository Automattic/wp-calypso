/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection } from 'my-sites/controller';
import { siteSettings } from 'my-sites/site-settings/settings-controller';
import { traffic } from './controller';

const redirectToTrafficSection = context => {
	page.redirect( '/settings/traffic/' + ( context.params.site_id || '' ) );
};

export default function() {
	page(
		'/settings/traffic/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		traffic,
		makeLayout,
		clientRender
	);

	// redirect legacy urls
	page( '/settings/analytics/:site_id?', redirectToTrafficSection );
	page( '/settings/seo/:site_id?', redirectToTrafficSection );
}
