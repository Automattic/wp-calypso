import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfCurrentUserCannot,
} from 'calypso/controller';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import {
	SETTINGS_SITE,
	SETTINGS_ADMINISTRATION,
	SETTINGS_ADMINISTRATION_RESET_SITE,
	SETTINGS_ADMINISTRATION_TRANSFER_SITE,
	SETTINGS_ADMINISTRATION_DELETE_SITE,
	SETTINGS_CACHING,
	SETTINGS_WEB_SERVER,
} from 'calypso/sites/components/site-preview-pane/constants';
import { showHostingFeaturesNoticeIfPresent, siteDashboard } from 'calypso/sites/controller';
import {
	redirectIfCantDeleteSite,
	redirectIfCantStartSiteOwnerTransfer,
} from './administration/controller';
import {
	siteSettings,
	administrationSettings,
	cachingSettings,
	webServerSettings,
	administrationToolDeleteSite,
	administrationToolResetSite,
	administrationToolTransferSite,
} from './controller';

export default function () {
	page( '/sites/settings/site', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/site/:site',
		siteSelection,
		navigation,
		redirectIfCurrentUserCannot( 'manage_options' ),
		siteSettings,
		siteDashboard( SETTINGS_SITE ),
		makeLayout,
		clientRender
	);

	page( '/sites/settings/administration', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/administration/:site',
		siteSelection,
		navigation,
		administrationSettings,
		siteDashboard( SETTINGS_ADMINISTRATION ),
		makeLayout,
		clientRender
	);
	page(
		'/sites/settings/site/:site/reset-site',
		siteSelection,
		redirectIfCantDeleteSite,
		navigation,
		administrationToolResetSite,
		siteDashboard( SETTINGS_ADMINISTRATION_RESET_SITE ),
		makeLayout,
		clientRender
	);
	page(
		'/sites/settings/site/:site/transfer-site',
		siteSelection,
		redirectIfCantStartSiteOwnerTransfer,
		navigation,
		administrationToolTransferSite,
		siteDashboard( SETTINGS_ADMINISTRATION_TRANSFER_SITE ),
		makeLayout,
		clientRender
	);
	page(
		'/sites/settings/site/:site/delete-site',
		siteSelection,
		redirectIfCantDeleteSite,
		navigation,
		administrationToolDeleteSite,
		siteDashboard( SETTINGS_ADMINISTRATION_DELETE_SITE ),
		makeLayout,
		clientRender
	);

	page( '/sites/settings/caching', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/caching/:site',
		siteSelection,
		navigation,
		showHostingFeaturesNoticeIfPresent,
		cachingSettings,
		siteDashboard( SETTINGS_CACHING ),
		makeLayout,
		clientRender
	);

	page( '/sites/settings/web-server', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/web-server/:site',
		siteSelection,
		navigation,
		showHostingFeaturesNoticeIfPresent,
		webServerSettings,
		siteDashboard( SETTINGS_WEB_SERVER ),
		makeLayout,
		clientRender
	);
}
