import page, { Callback, Context as PageJSContext } from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import {
	TOOLS_DEPLOYMENTS,
	TOOLS_MONITORING,
	TOOLS_LOGS_PHP,
	TOOLS_LOGS_WEB,
	TOOLS_STAGING_SITE,
	TOOLS_SFTP_SSH,
	TOOLS_DATABASE,
} from 'calypso/sites/components/site-preview-pane/constants';
import { redirectToHostingFeaturesIfNotAtomic, siteDashboard } from 'calypso/sites/controller';
import {
	stagingSite,
	deployments,
	monitoring,
	phpErrorLogs,
	sftpSsh,
	database,
	webServerLogs,
	deploymentCreation,
	deploymentManagement,
	deploymentRunLogs,
} from './controller';

export default function () {
	page( '/sites/tools/staging-site', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/staging-site/:site',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
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
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		deployments,
		siteDashboard( TOOLS_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);
	page(
		'/sites/tools/deployments/:site/create',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		deploymentCreation,
		siteDashboard( TOOLS_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);
	page(
		'/sites/tools/deployments/:site/manage/:deploymentId',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		deploymentManagement,
		siteDashboard( TOOLS_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);
	page(
		'/sites/tools/deployments/:site/logs/:deploymentId',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		deploymentRunLogs,
		siteDashboard( TOOLS_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);

	page( '/sites/tools/monitoring', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/monitoring/:site',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		monitoring,
		siteDashboard( TOOLS_MONITORING ),
		makeLayout,
		clientRender
	);

	const redirectLogsToPhp: Callback = ( context: PageJSContext ) => {
		return context.page.redirect( `/sites/tools/logs/${ context.params.site }/php` );
	};
	page( '/sites/tools/logs/:site', redirectLogsToPhp );
	page( '/sites/tools/logs', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/logs/:site/php',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		phpErrorLogs,
		siteDashboard( TOOLS_LOGS_PHP ),
		makeLayout,
		clientRender
	);
	page(
		'/sites/tools/logs/:site/web',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		webServerLogs,
		siteDashboard( TOOLS_LOGS_WEB ),
		makeLayout,
		clientRender
	);

	page( '/sites/tools/sftp-ssh', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/sftp-ssh/:site',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
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
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		database,
		siteDashboard( TOOLS_DATABASE ),
		makeLayout,
		clientRender
	);
}
