import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfCurrentUserCannot,
} from 'calypso/controller';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import {
	SETTINGS_SITE,
	SETTINGS_ADMINISTRATION_RESET_SITE,
	SETTINGS_ADMINISTRATION_TRANSFER_SITE,
	SETTINGS_ADMINISTRATION_DELETE_SITE,
	SETTINGS_PERFORMANCE,
	SETTINGS_SERVER,
	SETTINGS_DATABASE,
	SETTINGS_SFTP_SSH,
} from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import {
	redirectIfCantDeleteSite,
	redirectIfCantStartSiteOwnerTransfer,
} from './administration/controller';
import {
	siteSettings,
	administrationToolDeleteSite,
	administrationToolResetSite,
	administrationToolTransferSite,
	dashboardBackportSiteSettings,
	serverSettings,
	sftpSshSettings,
	databaseSettings,
	performanceSettings,
	redirectToSiteSettingsIfAdvancedHostingFeaturesNotSupported,
	redirectToSiteSettingsIfHostingFeaturesNotSupported,
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

	page( '/sites/settings/server', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/server/:site',
		siteSelection,
		redirectToSiteSettingsIfAdvancedHostingFeaturesNotSupported,
		navigation,
		serverSettings,
		siteDashboard( SETTINGS_SERVER ),
		makeLayout,
		clientRender
	);

	page( '/sites/settings/sftp-ssh', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/sftp-ssh/:site',
		siteSelection,
		redirectToSiteSettingsIfAdvancedHostingFeaturesNotSupported,
		navigation,
		sftpSshSettings,
		siteDashboard( SETTINGS_SFTP_SSH ),
		makeLayout,
		clientRender
	);

	page( '/sites/settings/database', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/database/:site',
		siteSelection,
		redirectToSiteSettingsIfAdvancedHostingFeaturesNotSupported,
		navigation,
		databaseSettings,
		siteDashboard( SETTINGS_DATABASE ),
		makeLayout,
		clientRender
	);

	page( '/sites/settings/performance', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/performance/:site',
		siteSelection,
		redirectToSiteSettingsIfHostingFeaturesNotSupported,
		navigation,
		performanceSettings,
		siteDashboard( SETTINGS_PERFORMANCE ),
		makeLayout,
		clientRender
	);

	/**
	 * Settings V2
	 */
	page( '/sites/settings/v2', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/v2/*',
		siteSelection,
		navigation,
		dashboardBackportSiteSettings,
		siteDashboard( SETTINGS_SITE ),
		makeLayout,
		clientRender
	);
}
