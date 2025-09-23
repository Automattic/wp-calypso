import { wpcom } from '../wpcom-fetcher';
import type { DeploymentRun, CodeDeploymentDeleteResponse } from './types';

export async function createCodeDeploymentRun(
	siteId: number,
	deploymentId: number
): Promise< DeploymentRun > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }/runs`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function deleteCodeDeployment(
	siteId: number,
	deploymentId: number,
	removeFiles: boolean
): Promise< CodeDeploymentDeleteResponse > {
	return wpcom.req.post(
		{
			method: 'DELETE',
			path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }`,
			apiNamespace: 'wpcom/v2',
		},
		{
			remove_files: removeFiles,
		}
	);
}
