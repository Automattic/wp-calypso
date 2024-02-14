import { addQueryArgs } from 'calypso/lib/url';

interface CreateRepositoryRouteParams {
	installationId?: number;
	repositoryId?: number;
}

export const indexPage = ( siteSlug: string ) => `/github-deployments/${ siteSlug }`;

export const createDeploymentPage = (
	siteSlug: string,
	{ installationId, repositoryId }: CreateRepositoryRouteParams = {}
) => {
	return addQueryArgs(
		{ installation_id: installationId, repository_id: repositoryId },
		`${ indexPage( siteSlug ) }/create`
	);
};

export const manageDeploymentPage = ( siteSlug: string, deploymentId: number ) => {
	return `${ indexPage( siteSlug ) }/manage/${ deploymentId }`;
};
