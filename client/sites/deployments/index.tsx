import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { DEPLOYMENTS } from 'calypso/sites/components/site-preview-pane/constants';
import { redirectToHostingFeaturesIfNotAtomic, siteDashboard } from 'calypso/sites/controller';
import {
	deploymentCallout,
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
		deploymentCallout,
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
		deploymentCallout,
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
		deploymentCallout,
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
		deploymentCallout,
		siteDashboard( DEPLOYMENTS ),
		makeLayout,
		clientRender
	);
}
