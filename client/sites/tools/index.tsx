import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import {
	TOOLS_DEPLOYMENTS,
	TOOLS_MONITORING,
	TOOLS_STAGING_SITE,
	TOOLS,
} from 'calypso/sites/components/site-preview-pane/constants';
import { redirectToHostingFeaturesIfNotAtomic, siteDashboard } from 'calypso/sites/controller';
import {
	stagingSite,
	deployments,
	monitoring,
	deploymentCreation,
	deploymentManagement,
	deploymentRunLogs,
	tools,
} from './controller';

export default function () {
	page( '/sites/tools', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/tools/:site',
		siteSelection,
		navigation,
		tools,
		siteDashboard( TOOLS ),
		makeLayout,
		clientRender
	);

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
}
