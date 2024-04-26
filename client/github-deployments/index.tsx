import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible } from 'calypso/my-sites/github-deployments/controller';
import globalSiteLayout from 'calypso/sites-dashboard-v2/global-site-layout';
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
		deploymentsList,
		globalSiteLayout( DOTCOM_GITHUB_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);

	page(
		'/github-deployments/:site/create',
		siteSelection,
		redirectHomeIfIneligible,
		deploymentCreation,
		globalSiteLayout( DOTCOM_GITHUB_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);

	page(
		'/github-deployments/:site/manage/:deploymentId',
		siteSelection,
		redirectHomeIfIneligible,
		deploymentManagement,
		globalSiteLayout( DOTCOM_GITHUB_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);

	page(
		'/github-deployments/:site/logs/:deploymentId',
		siteSelection,
		redirectHomeIfIneligible,
		deploymentRunLogs,
		globalSiteLayout( DOTCOM_GITHUB_DEPLOYMENTS ),
		makeLayout,
		clientRender
	);
}
