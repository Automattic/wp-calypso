import { addQueryArgs } from 'calypso/lib/url';

interface CreateRepositoryRouteParams {
	installationId?: number;
	repositoryId?: number;
}

export const index = ( siteSlug: string ) => `/github-deployments/${ siteSlug }`;

export const createRepository = (
	siteSlug: string,
	{ installationId, repositoryId }: CreateRepositoryRouteParams = {}
) => {
	return addQueryArgs(
		{ installation_id: installationId, repository_id: repositoryId },
		`${ index( siteSlug ) }/create`
	);
};

export const manageDeployment = ( siteSlug: string, deploymentId: number ) => {
	return `${ index( siteSlug ) }/manage/${ deploymentId }`;
};
