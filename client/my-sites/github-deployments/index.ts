import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	redirectHomeIfIneligible,
	deploymentsList,
	deploymentCreation,
	deploymentManagement,
	deploymentRunLogs,
} from './controller';

export default function () {
	page( '/github-deployments', siteSelection, sites, makeLayout, clientRender );

	page(
		'/github-deployments/:site',
		siteSelection,
		redirectHomeIfIneligible,
		navigation,
		deploymentsList,
		makeLayout,
		clientRender
	);

	page(
		'/github-deployments/:site/create',
		siteSelection,
		redirectHomeIfIneligible,
		navigation,
		deploymentCreation,
		makeLayout,
		clientRender
	);

	page(
		'/github-deployments/:site/manage/:deploymentId',
		siteSelection,
		redirectHomeIfIneligible,
		navigation,
		deploymentManagement,
		makeLayout,
		clientRender
	);

	page(
		'/github-deployments/:site/logs/:deploymentId',
		siteSelection,
		redirectHomeIfIneligible,
		navigation,
		deploymentRunLogs,
		makeLayout,
		clientRender
	);
}
