import { __ } from '@wordpress/i18n';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { GitHubDeploymentCreation } from 'calypso/my-sites/github-deployments/deployment-creation';
import { GitHubDeploymentManagement } from 'calypso/my-sites/github-deployments/deployment-management';
import { DeploymentRunsLogs } from 'calypso/my-sites/github-deployments/deployment-run-logs';
import { GitHubDeployments } from 'calypso/my-sites/github-deployments/deployments';
import { indexPage } from 'calypso/my-sites/github-deployments/routes';
import MySitesNavigation from 'calypso/my-sites/navigation';
import { errorNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { Callback } from '@automattic/calypso-router';

export const deploymentsList: Callback = ( context, next ) => {
	context.secondary = <MySitesNavigation path={ context.path } />;
	context.primary = (
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

export const redirectHomeIfIneligible: Callback = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	if ( ! siteId ) {
		context.page.replace( `/home/${ siteSlug }` );
		return;
	}

	if ( isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } ) ) {
		context.page.replace( `/stats/day/${ siteSlug }` );
		return;
	}

	const canManageOptions = canCurrentUser( state, siteId, 'manage_options' );

	if ( ! canManageOptions ) {
		context.store.dispatch(
			errorNotice( __( 'You are not authorized to manage GitHub Deployments for this site.' ), {
				displayOnNextPage: true,
			} )
		);
		context.page.replace( `/home/${ siteSlug }` );
		return;
	}

	next();
};
