import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectToDevToolsPromoIfNotAtomic,
} from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	redirectHomeIfIneligible,
	deploymentCreation,
	deploymentManagement,
	deploymentRunLogs,
	deploymentsList,
} from 'calypso/my-sites/github-deployments/controller';
import { siteDashboard } from 'calypso/sites-dashboard-v2/controller';
import { DOTCOM_GITHUB_DEPLOYMENTS } from 'calypso/sites-dashboard-v2/site-preview-pane/constants';

export default function () {
	page( '/github-deployments', siteSelection, sites, makeLayout, clientRender );

	page(
		'/github-deployments/:site',
		siteSelection,
		redirectToDevToolsPromoIfNotAtomic,
		redirectHomeIfIneligible,
		navigation,
		deploymentsList,
		siteDashboard( DOTCOM_GITHUB_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);

	page(
		'/github-deployments/:site/create',
		siteSelection,
		redirectToDevToolsPromoIfNotAtomic,
		redirectHomeIfIneligible,
		navigation,
		deploymentCreation,
		siteDashboard( DOTCOM_GITHUB_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);

	page(
		'/github-deployments/:site/manage/:deploymentId',
		siteSelection,
		redirectToDevToolsPromoIfNotAtomic,
		redirectHomeIfIneligible,
		navigation,
		deploymentManagement,
		siteDashboard( DOTCOM_GITHUB_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);

	page(
		'/github-deployments/:site/logs/:deploymentId',
		siteSelection,
		redirectToDevToolsPromoIfNotAtomic,
		redirectHomeIfIneligible,
		navigation,
		deploymentRunLogs,
		siteDashboard( DOTCOM_GITHUB_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);
}
