import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { GitHubDeploymentCreation } from './deployment-creation';
import { GitHubDeploymentManagement } from './deployment-management';
import { DeploymentRunsLogs } from './deployment-run-logs';
import { GitHubDeployments } from './deployments';
import { indexPage } from './routes';
import type { Callback } from '@automattic/calypso-router';

export const deploymentsList: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker path="/github-deployments/:site" title="Sites > Deployments" delay={ 500 } />
			<GitHubDeployments />
		</>
	);
	next();
};

export const deploymentCreation: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker
				path="/github-deployments/:site/create"
				title="Sites > Deployments > Create"
				delay={ 500 }
			/>
			<GitHubDeploymentCreation />
		</>
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

	context.primary = (
		<>
			<PageViewTracker
				path="/github-deployments/:site/manage/:deploymentId"
				title="Sites > Deployments > Manage"
				delay={ 500 }
			/>
			<GitHubDeploymentManagement codeDeploymentId={ codeDeploymentId } />
		</>
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

	context.primary = (
		<>
			<PageViewTracker
				path="/github-deployments/:site/logs/:deploymentId"
				title="Sites > Deployments > Run logs"
				delay={ 500 }
			/>
			<DeploymentRunsLogs codeDeploymentId={ codeDeploymentId } />
		</>
	);
	next();
};
