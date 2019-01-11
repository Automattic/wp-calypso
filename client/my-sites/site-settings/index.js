/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from 'my-sites/site-settings/controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { reasonComponents as reasons } from './disconnect-site';
import { setScroll, siteSettings } from 'my-sites/site-settings/settings-controller';

export default function() {
	page( '/settings', siteSelection, controller.redirectToGeneral );
	page(
		'/settings/general/:site_id',
		siteSelection,
		navigation,
		setScroll,
		siteSettings,
		controller.general,
		makeLayout,
		clientRender
	);

	page(
		'/settings/import/:site_id',
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
		setScroll,
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
		setScroll,
		controller.disconnectSite,
		makeLayout,
		clientRender
	);

	page(
		'/settings/disconnect-site/confirm/:site_id',
		siteSelection,
		setScroll,
		controller.disconnectSiteConfirm,
		makeLayout,
		clientRender
	);

	page(
		'/settings/start-over/:site_id',
		siteSelection,
		navigation,
		setScroll,
		controller.redirectIfCantDeleteSite,
		controller.startOver,
		makeLayout,
		clientRender
	);
	page(
		'/settings/theme-setup/:site_id',
		siteSelection,
		navigation,
		setScroll,
		controller.themeSetup,
		makeLayout,
		clientRender
	);

	page(
		'/settings/manage-connection/:site_id',
		siteSelection,
		navigation,
		setScroll,
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
