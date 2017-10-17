/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { siteSelection, navigation, sites } from 'my-sites/controller';
import controller from 'my-sites/site-settings/controller';
import settingsController from 'my-sites/site-settings/settings-controller';

export default function() {
	page( '/settings', siteSelection, controller.redirectToGeneral );
	page(
		'/settings/general/:site_id',
		siteSelection,
		navigation,
		settingsController.setScroll,
		settingsController.siteSettings,
		controller.general
	);

	page( '/settings/import/:site_id', siteSelection, navigation, controller.importSite );

	if ( config.isEnabled( 'manage/export/guided-transfer' ) ) {
		page(
			'/settings/export/guided/:host_slug?/:site_id',
			siteSelection,
			navigation,
			controller.guidedTransfer
		);
	}

	page( '/settings/export/:site_id', siteSelection, navigation, controller.exportSite );

	page(
		'/settings/delete-site/:site_id',
		siteSelection,
		navigation,
		settingsController.setScroll,
		controller.deleteSite
	);

	if ( config.isEnabled( 'manage/site-settings/disconnect-flow' ) ) {
		page(
			'/settings/disconnect-site/:site_id',
			siteSelection,
			settingsController.setScroll,
			controller.disconnectSite
		);
	}

	page(
		'/settings/start-over/:site_id',
		siteSelection,
		navigation,
		settingsController.setScroll,
		controller.startOver
	);
	page(
		'/settings/theme-setup/:site_id',
		siteSelection,
		navigation,
		settingsController.setScroll,
		controller.themeSetup
	);

	page(
		'/settings/manage-connection/:site_id',
		siteSelection,
		navigation,
		settingsController.setScroll,
		controller.manageConnection
	);

	page( '/settings/:section', controller.legacyRedirects, siteSelection, sites );
}
