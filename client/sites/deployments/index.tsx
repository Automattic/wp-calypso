import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { DEPLOYMENTS } from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
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
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params: Record< string, string > ) => `/sites/${ params.site }/deployments`
		),
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
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params: Record< string, string > ) => `/sites/${ params.site }/settings/repositories`
		),
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
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params: Record< string, string > ) =>
				`/sites/${ params.site }/settings/repositories/manage/${ params.deploymentId }`
		),
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
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params: Record< string, string > ) => `/sites/${ params.site }/deployments`
		),
		navigation,
		deploymentRunLogs,
		deploymentCallout,
		siteDashboard( DEPLOYMENTS ),
		makeLayout,
		clientRender
	);
}
