import { isEnabled } from '@automattic/calypso-config';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { GitHubDeploymentCreation } from 'calypso/my-sites/github-deployments/deployment-creation';
import { GitHubDeploymentManagement } from 'calypso/my-sites/github-deployments/deployment-management';
import { DeploymentRunsLogs } from 'calypso/my-sites/github-deployments/deployment-run-logs';
import { GitHubDeployments } from 'calypso/my-sites/github-deployments/deployments';
import { indexPage } from 'calypso/my-sites/github-deployments/routes';
import MySitesNavigation from 'calypso/my-sites/navigation';
import SitesDashboardV2 from 'calypso/sites-dashboard-v2';
import { DOTCOM_GITHUB_DEPLOYMENTS } from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { isGlobalSiteViewEnabled } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import type { Callback, Context as PageJSContext } from '@automattic/calypso-router';

function shouldShowInSitesFlyoutPanel( context: PageJSContext, feature: string ) {
	const state = context.store.getState();
	const selectedSiteId = getSelectedSiteId( state );

	// Show the hosting configuration page in the preview pane from the sites dashboard.
	if (
		isEnabled( 'layout/dotcom-nav-redesign-v2' ) &&
		isGlobalSiteViewEnabled( state, selectedSiteId )
	) {
		const selectedSite = getSelectedSite( state );
		return (
			// Sites Dashboard V2 - Dotcom Nav Redesign V2
			<SitesDashboardV2
				queryParams={ {} }
				selectedSite={ selectedSite }
				selectedFeature={ feature }
			/>
		);
	}
}

export const deploymentsList: Callback = ( context, next ) => {
	context.secondary = <MySitesNavigation path={ context.path } />;
	context.primary = shouldShowInSitesFlyoutPanel( context, DOTCOM_GITHUB_DEPLOYMENTS ) ?? (
		<div className="deployment-list">
			<PageViewTracker path="/github-deployments/:site" title="GitHub Deployments" delay={ 500 } />
			<GitHubDeployments />
		</div>
	);
	next();
};

export const deploymentCreation: Callback = ( context, next ) => {
	context.secondary = <MySitesNavigation path={ context.path } />;
	context.primary = (
		<div className="deployment-creation">
			<PageViewTracker
				path="/github-deployments/:site/create"
				title="Create GitHub Deployments"
				delay={ 500 }
			/>
			<GitHubDeploymentCreation />
		</div>
	);
	next();
};

export const deploymentManagement: Callback = ( context, next ) => {
	const codeDeploymentId = parseInt( context.params.deploymentId, 10 ) || null;
	const state = context.store.getState();
	const siteSlug = getSelectedSiteSlug( state );

	if ( ! codeDeploymentId ) {
		return context.page.replace( indexPage( siteSlug! ) );
	}

	context.secondary = <MySitesNavigation path={ context.path } />;
	context.primary = (
		<div className="deployment-management">
			<PageViewTracker
				path="/github-deployments/:site/manage/:deploymentId"
				title="Manage GitHub Deployment"
				delay={ 500 }
			/>
			<GitHubDeploymentManagement codeDeploymentId={ codeDeploymentId } />
		</div>
	);
	next();
};

export const deploymentRunLogs: Callback = ( context, next ) => {
	const codeDeploymentId = parseInt( context.params.deploymentId, 10 ) || null;
	const state = context.store.getState();
	const siteSlug = getSelectedSiteSlug( state );

	if ( ! codeDeploymentId ) {
		return context.page.replace( indexPage( siteSlug! ) );
	}

	context.secondary = <MySitesNavigation path={ context.path } />;
	context.primary = (
		<div className="deployment-run-logs">
			<PageViewTracker
				path="/github-deployments/:site/logs/:deploymentId"
				title="GitHub Deployments"
				delay={ 500 }
			/>
			<DeploymentRunsLogs codeDeploymentId={ codeDeploymentId } />
		</div>
	);
	next();
};
