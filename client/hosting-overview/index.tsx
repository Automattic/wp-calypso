import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible } from 'calypso/my-sites/github-deployments/controller';
import { handleHostingPanelRedirect } from 'calypso/my-sites/hosting/controller';
import { hostingOverview, hostingConfiguration, hostingActivate } from './controller';

export default function () {
	page( '/hosting-overview', siteSelection, sites, makeLayout, clientRender );
	page( '/hosting-overview/:site', siteSelection, hostingOverview, makeLayout, clientRender );

	page( '/hosting-config', siteSelection, sites, makeLayout, clientRender );

	page(
		'/hosting-config/:site_id',
		siteSelection,
		navigation,
		redirectHomeIfIneligible,
		handleHostingPanelRedirect,
		hostingConfiguration,
		makeLayout,
		clientRender
	);

	page(
		'/hosting-config/activate/:site_id',
		siteSelection,
		navigation,
		redirectHomeIfIneligible,
		handleHostingPanelRedirect,
		hostingActivate,
		makeLayout,
		clientRender
	);
}
