/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import mySitesController from 'my-sites/controller';
import settingsController from 'my-sites/site-settings/settings-controller';

const redirectToTrafficSection = context => {
	page.redirect( '/settings/traffic/' + ( context.params.site_id || '' ) );
};

export default function() {
	page(
		'/settings/traffic/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		settingsController.siteSettings,
		controller.traffic
	);

	// redirect legacy urls
	page( '/settings/analytics/:site_id?', redirectToTrafficSection );
	page( '/settings/seo/:site_id?', redirectToTrafficSection );
}
