import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible, githubDeployments } from './controller';

export default function () {
	page( '/github-deployments', siteSelection, sites, makeLayout, clientRender );

	page(
		'/github-deployments/:siteId',
		siteSelection,
		redirectHomeIfIneligible,
		navigation,
		githubDeployments,
		makeLayout,
		clientRender
	);
}
