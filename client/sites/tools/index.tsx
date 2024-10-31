import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import {
	TOOLS_DEPLOYMENTS,
	TOOLS_MONITORING,
	TOOLS_LOGS,
	TOOLS_STAGING_SITE,
	TOOLS_SFTP_SSH,
	TOOLS_DATABASE,
} from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { stagingSite, deployments, monitoring, logs, sftpSsh, database } from './controller';

export default function () {
	page( '/sites/tools/staging-site', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/staging-site/:site',
		siteSelection,
		navigation,
		stagingSite,
		siteDashboard( TOOLS_STAGING_SITE ),
		makeLayout,
		clientRender
	);

	page( '/sites/tools/deployments', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/deployments/:site',
		siteSelection,
		navigation,
		deployments,
		siteDashboard( TOOLS_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);

	page( '/sites/tools/monitoring', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/monitoring/:site',
		siteSelection,
		navigation,
		monitoring,
		siteDashboard( TOOLS_MONITORING ),
		makeLayout,
		clientRender
	);

	page( '/sites/tools/logs', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/logs/:site',
		siteSelection,
		navigation,
		logs,
		siteDashboard( TOOLS_LOGS ),
		makeLayout,
		clientRender
	);

	page( '/sites/tools/sftp-ssh', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/sftp-ssh/:site',
		siteSelection,
		navigation,
		sftpSsh,
		siteDashboard( TOOLS_SFTP_SSH ),
		makeLayout,
		clientRender
	);

	page( '/sites/tools/database', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/database/:site',
		siteSelection,
		navigation,
		database,
		siteDashboard( TOOLS_DATABASE ),
		makeLayout,
		clientRender
	);
}
