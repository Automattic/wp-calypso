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
import mySitesController from 'my-sites/controller';
import controller from 'my-sites/site-settings/controller';
import settingsController from 'my-sites/site-settings/settings-controller';
import { reasonComponents as reasons } from './disconnect-site';

export default function() {
	page( '/settings', mySitesController.siteSelection, controller.redirectToGeneral );
	page(
		'/settings/general/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		settingsController.setScroll,
		settingsController.siteSettings,
		controller.general
	);

	page(
		'/settings/import/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		controller.importSite
	);

	if ( config.isEnabled( 'manage/export/guided-transfer' ) ) {
		page(
			'/settings/export/guided/:host_slug?/:site_id',
			mySitesController.siteSelection,
			mySitesController.navigation,
			controller.guidedTransfer
		);
	}

	page(
		'/settings/export/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		controller.exportSite
	);

	page(
		'/settings/delete-site/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		settingsController.setScroll,
		controller.deleteSite
	);

	if ( config.isEnabled( 'manage/site-settings/disconnect-flow' ) ) {
		page(
			`/settings/disconnect-site/:site_id/:reason(${ Object.keys( reasons ).join( '|' ) })?`,
			mySitesController.siteSelection,
			settingsController.setScroll,
			controller.disconnectSite
		);
	}

	page(
		'/settings/start-over/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		settingsController.setScroll,
		controller.startOver
	);
	page(
		'/settings/theme-setup/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		settingsController.setScroll,
		controller.themeSetup
	);

	page(
		'/settings/manage-connection/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		settingsController.setScroll,
		controller.manageConnection
	);

	page(
		'/settings/:section',
		controller.legacyRedirects,
		mySitesController.siteSelection,
		mySitesController.sites
	);
}
