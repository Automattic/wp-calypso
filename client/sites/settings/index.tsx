import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import {
	SETTINGS_SITE,
	SETTINGS_ADMINISTRATION,
	SETTINGS_ADMINISTRATION_RESET_SITE,
	SETTINGS_ADMINISTRATION_TRANSFER_SITE,
	SETTINGS_ADMINISTRATION_DELETE_SITE,
	SETTINGS_ADMINISTRATION_MANAGE_CONNECTION,
	SETTINGS_CACHING,
	SETTINGS_WEB_SERVER,
} from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import {
	siteSettings,
	administrationSettings,
	cachingSettings,
	webServerSettings,
	administrationToolDeleteSite,
	administrationToolResetSite,
	administrationToolTransferSite,
	administrationToolManageConnection,
} from './controller';

export default function () {
	page( '/sites/settings/site', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/site/:site',
		siteSelection,
		navigation,
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
		'/sites/settings/administration/:site/reset-site',
		siteSelection,
		navigation,
		administrationToolResetSite,
		siteDashboard( SETTINGS_ADMINISTRATION_RESET_SITE ),
		makeLayout,
		clientRender
	);
	page(
		'/sites/settings/administration/:site/transfer-site',
		siteSelection,
		navigation,
		administrationToolTransferSite,
		siteDashboard( SETTINGS_ADMINISTRATION_TRANSFER_SITE ),
		makeLayout,
		clientRender
	);
	page(
		'/sites/settings/administration/:site/delete-site',
		siteSelection,
		navigation,
		administrationToolDeleteSite,
		siteDashboard( SETTINGS_ADMINISTRATION_DELETE_SITE ),
		makeLayout,
		clientRender
	);
	page(
		'/sites/settings/administration/:site/manage-connection',
		siteSelection,
		navigation,
		administrationToolManageConnection,
		siteDashboard( SETTINGS_ADMINISTRATION_MANAGE_CONNECTION ),
		makeLayout,
		clientRender
	);

	page( '/sites/settings/caching', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/caching/:site',
		siteSelection,
		navigation,
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
		webServerSettings,
		siteDashboard( SETTINGS_WEB_SERVER ),
		makeLayout,
		clientRender
	);
}
