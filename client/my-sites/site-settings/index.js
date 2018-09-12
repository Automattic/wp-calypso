/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import controller from 'my-sites/site-settings/controller';
import settingsController from 'my-sites/site-settings/settings-controller';
import { reasonComponents as reasons } from './disconnect-site';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/settings', siteSelection, controller.redirectToGeneral );
	page(
		'/settings/general/:site_id',
		siteSelection,
		navigation,
		settingsController.setScroll,
		settingsController.siteSettings,
		controller.general,
		makeLayout,
		clientRender
	);

	page(
		'/settings/import/:site_id/:engine?',
		siteSelection,
		navigation,
		controller.importSite,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'manage/export/guided-transfer' ) ) {
		page(
			'/settings/export/guided/:host_slug?/:site_id',
			siteSelection,
			navigation,
			controller.guidedTransfer,
			makeLayout,
			clientRender
		);
	}

	page(
		'/settings/export/:site_id',
		siteSelection,
		navigation,
		controller.exportSite,
		makeLayout,
		clientRender
	);

	page(
		'/settings/delete-site/:site_id',
		siteSelection,
		navigation,
		settingsController.setScroll,
		controller.redirectIfCantDeleteSite,
		controller.deleteSite,
		makeLayout,
		clientRender
	);

	const reasonSlugs = Object.keys( reasons );
	page(
		`/settings/disconnect-site/:step(${ [ ...reasonSlugs, 'confirm' ].join( '|' ) })?`,
		sites,
		makeLayout,
		clientRender
	);

	page(
		`/settings/disconnect-site/:reason(${ reasonSlugs.join( '|' ) })?/:site_id`,
		siteSelection,
		settingsController.setScroll,
		controller.disconnectSite,
		makeLayout,
		clientRender
	);

	page(
		'/settings/disconnect-site/confirm/:site_id',
		siteSelection,
		settingsController.setScroll,
		controller.disconnectSiteConfirm,
		makeLayout,
		clientRender
	);

	page(
		'/settings/start-over/:site_id',
		siteSelection,
		navigation,
		settingsController.setScroll,
		controller.redirectIfCantDeleteSite,
		controller.startOver,
		makeLayout,
		clientRender
	);
	page(
		'/settings/theme-setup/:site_id',
		siteSelection,
		navigation,
		settingsController.setScroll,
		controller.themeSetup,
		makeLayout,
		clientRender
	);

	page(
		'/settings/manage-connection/:site_id',
		siteSelection,
		navigation,
		settingsController.setScroll,
		controller.manageConnection,
		makeLayout,
		clientRender
	);

	page(
		'/settings/:section',
		controller.legacyRedirects,
		siteSelection,
		sites,
		makeLayout,
		clientRender
	);
}
