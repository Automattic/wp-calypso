/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import { navigation, siteSelection } from 'my-sites/controller';
import settingsController from 'my-sites/site-settings/settings-controller';
import { makeLayout, render as clientRender } from 'controller';

const redirectToTrafficSection = context => {
	const sectionAnchor = context.hashstring;
	const siteId = context.params.site_id || '';

	page.redirect( '/settings/traffic/' + siteId );
	sectionAnchor && window.location.replace( '/settings/traffic/' + siteId + '#' + sectionAnchor );
};

export default function() {
	page(
		'/settings/traffic/:site_id',
		siteSelection,
		navigation,
		settingsController.siteSettings,
		controller.traffic,
		makeLayout,
		clientRender
	);

	// redirect legacy urls
	page( '/settings/analytics/:site_id?', redirectToTrafficSection );
	page( '/settings/seo/:site_id?', redirectToTrafficSection );
}
