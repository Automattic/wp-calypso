import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import {
	SITE_TOOLS_STAGING_SITE,
	SITE_TOOLS_DEPLOYMENTS,
	SITE_TOOLS_MONITORING,
	SITE_TOOLS_LOGS,
	SITE_TOOLS_DATABASE,
	SITE_TOOLS_SFTP_SSH,
} from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { deployments, stagingSite, monitoring, logs, sftp, database } from './controller';

export default function () {
	page( '/sites/tools/staging-site', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/staging-site/:site',
		siteSelection,
		navigation,
		stagingSite,
		siteDashboard( SITE_TOOLS_STAGING_SITE ),
		makeLayout,
		clientRender
	);

	page( '/sites/tools/deployments', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/deployments/:site',
		siteSelection,
		navigation,
		deployments,
		siteDashboard( SITE_TOOLS_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);

	page( '/sites/tools/monitoring', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/monitoring/:site',
		siteSelection,
		navigation,
		monitoring,
		siteDashboard( SITE_TOOLS_MONITORING ),
		makeLayout,
		clientRender
	);

	page( '/sites/tools/logs', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/logs/:site',
		siteSelection,
		navigation,
		logs,
		siteDashboard( SITE_TOOLS_LOGS ),
		makeLayout,
		clientRender
	);

	page( '/sites/tools/sftp-ssh', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/sftp-ssh/:site',
		siteSelection,
		navigation,
		sftp,
		siteDashboard( SITE_TOOLS_SFTP_SSH ),
		makeLayout,
		clientRender
	);

	page( '/sites/tools/database', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/database/:site',
		siteSelection,
		navigation,
		database,
		siteDashboard( SITE_TOOLS_DATABASE ),
		makeLayout,
		clientRender
	);
}
