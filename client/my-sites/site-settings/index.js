/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	deleteSite,
	disconnectSite,
	disconnectSiteConfirm,
	exportSite,
	general,
	guidedTransfer,
	importSite,
	legacyRedirects,
	manageConnection,
	redirectIfCantDeleteSite,
	redirectToSeo,
	startOver,
	themeSetup,
} from 'my-sites/site-settings/controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { reasonComponents as reasons } from './disconnect-site';
import { setScroll, siteSettings } from 'my-sites/site-settings/settings-controller';

export default function() {
	page( '/settings', '/settings/general' );
	page(
		'/settings/general/:site_id',
		siteSelection,
		navigation,
		setScroll,
		siteSettings,
		general,
		makeLayout,
		clientRender
	);

	page(
		'/settings/import/:site_id',
		siteSelection,
		navigation,
		importSite,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'manage/export/guided-transfer' ) ) {
		page(
			'/settings/export/guided/:host_slug?/:site_id',
			siteSelection,
			navigation,
			guidedTransfer,
			makeLayout,
			clientRender
		);
	}

	page(
		'/settings/export/:site_id',
		siteSelection,
		navigation,
		exportSite,
		makeLayout,
		clientRender
	);

	page(
		'/settings/delete-site/:site_id',
		siteSelection,
		redirectIfCantDeleteSite,
		navigation,
		setScroll,
		deleteSite,
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
		disconnectSite,
		makeLayout,
		clientRender
	);

	page(
		'/settings/disconnect-site/confirm/:site_id',
		siteSelection,
		setScroll,
		disconnectSiteConfirm,
		makeLayout,
		clientRender
	);

	page(
		'/settings/start-over/:site_id',
		siteSelection,
		redirectIfCantDeleteSite,
		navigation,
		setScroll,
		startOver,
		makeLayout,
		clientRender
	);
	page(
		'/settings/theme-setup/:site_id',
		siteSelection,
		navigation,
		setScroll,
		themeSetup,
		makeLayout,
		clientRender
	);

	page(
		'/settings/manage-connection/:site_id',
		siteSelection,
		navigation,
		setScroll,
		manageConnection,
		makeLayout,
		clientRender
	);

	page( '/settings/traffic/:site_id', redirectToSeo );
	page( '/settings/analytics/:site_id?', redirectToSeo );
	page( '/settings/seo/:site_id?', redirectToSeo );

	page( '/settings/:section', legacyRedirects, siteSelection, sites, makeLayout, clientRender );
}
