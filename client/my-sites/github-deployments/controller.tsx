import { PageViewTracker } from 'calypso/lib/analytics/page-view-tracker';
import { CreateRepository } from 'calypso/my-sites/github-deployments/components/repositories/create-repository/index';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { GitHubDeploymentCreation } from './deployment-creation';
import { GitHubDeploymentManagement } from './deployment-management';
import { GitHubDeployments } from './deployments';
import { indexPage } from './routes';
import {
	GitHubDeploymentsAvailableResponse,
	gitHubDeploymentsAvailableQueryOptions,
} from './use-is-feature-available';
import type { Callback } from '@automattic/calypso-router';

export const deploymentsList: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker path="/github-deployments/:site" title="GitHub Deployments" delay={ 500 } />
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
				title="Create GitHub Deployments"
				delay={ 500 }
			/>
			<GitHubDeploymentCreation
				installationId={ parseInt( context.query.installation_id, 10 ) || undefined }
				repositoryId={ parseInt( context.query.repository_id, 10 ) || undefined }
			/>
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
				title="Manage GitHub Deployment"
				delay={ 500 }
			/>
			<GitHubDeploymentManagement codeDeploymentId={ codeDeploymentId } />
		</>
	);
	next();
};

export const createNewRepository: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker
				path="/github-deployments/:site/create-new-repository"
				title="Create Repository"
				delay={ 500 }
			/>
			<CreateRepository />
		</>
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

	context.queryClient
		.fetchQuery( gitHubDeploymentsAvailableQueryOptions( { siteId } ) )
		.then( ( result: GitHubDeploymentsAvailableResponse ) => {
			if ( result.available ) {
				next();
			} else {
				context.page.replace( `/home/${ siteSlug }` );
			}
		} )
		.catch( () => {
			context.page.replace( `/home/${ siteSlug }` );
		} );
};
