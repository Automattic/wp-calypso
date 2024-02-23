import { addQueryArgs } from 'calypso/lib/url';

interface CreateDeploymentRouteParams {
	installationId?: number;
	repositoryId?: number;
}

interface CreateNewRepositoryRouteParams {
	installationId?: number;
}

export const indexPage = ( siteSlug: string ) => `/github-deployments/${ siteSlug }`;

export const createPage = ( siteSlug: string ) => `/github-deployments/${ siteSlug }/create`;

export const createDeploymentPage = (
	siteSlug: string,
	{ installationId, repositoryId }: CreateDeploymentRouteParams = {}
) => {
	return addQueryArgs(
		{ installation_id: installationId, repository_id: repositoryId },
		`${ indexPage( siteSlug ) }/create`
	);
};

export const manageDeploymentPage = ( siteSlug: string, deploymentId: number ) => {
	return `${ indexPage( siteSlug ) }/manage/${ deploymentId }`;
};

export const viewDeploymentLogs = ( siteSlug: string, deploymentId: number ) => {
	return `${ indexPage( siteSlug ) }/logs/${ deploymentId }`;
};

export const createRepositoryPage = (
	siteSlug: string,
	{ installationId }: CreateNewRepositoryRouteParams = {}
) => {
	return addQueryArgs(
		{ installation_id: installationId },
		`${ indexPage( siteSlug ) }/create-new-repository`
	);
};
