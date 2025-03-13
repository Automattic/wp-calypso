import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { DEPLOYMENTS } from 'calypso/sites/components/site-preview-pane/constants';
import { redirectToHostingFeaturesIfNotAtomic, siteDashboard } from 'calypso/sites/controller';
import {
	deploymentCreation,
	deploymentManagement,
	deploymentRunLogs,
	deploymentsList,
} from './controller';

export default function () {
	page( '/github-deployments', siteSelection, sites, makeLayout, clientRender );

	page(
		'/github-deployments/:site',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		deploymentsList,
		siteDashboard( DEPLOYMENTS ),
		makeLayout,
		clientRender
	);

	page(
		'/github-deployments/:site/create',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		deploymentCreation,
		siteDashboard( DEPLOYMENTS ),
		makeLayout,
		clientRender
	);

	page(
		'/github-deployments/:site/manage/:deploymentId',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		deploymentManagement,
		siteDashboard( DEPLOYMENTS ),
		makeLayout,
		clientRender
	);

	page(
		'/github-deployments/:site/logs/:deploymentId',
		siteSelection,
		redirectToHostingFeaturesIfNotAtomic,
		navigation,
		deploymentRunLogs,
		siteDashboard( DEPLOYMENTS ),
		makeLayout,
		clientRender
	);
}
