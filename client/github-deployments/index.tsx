import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible } from 'calypso/my-sites/github-deployments/controller';
import { siteDashboard } from 'calypso/sites-dashboard-v2/controller';
import { DOTCOM_GITHUB_DEPLOYMENTS } from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
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
		redirectHomeIfIneligible,
		navigation,
		deploymentRunLogs,
		siteDashboard( DOTCOM_GITHUB_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);
}
