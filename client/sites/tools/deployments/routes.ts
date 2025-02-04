import { isEnabled } from '@automattic/calypso-config';
import { addQueryArgs } from 'calypso/lib/url';

interface CreateDeploymentRouteParams {
	installationId?: number;
	repositoryId?: number;
}

export const indexPage = ( siteSlug: string ) =>
	isEnabled( 'untangling/hosting-menu' )
		? `/sites/tools/deployments/${ siteSlug }`
		: `/github-deployments/${ siteSlug }`;

export const createPage = ( siteSlug: string ) => `${ indexPage( siteSlug ) }/create`;

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
