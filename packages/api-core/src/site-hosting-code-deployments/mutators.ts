import { wpcom } from '../wpcom-fetcher';
import { CodeDeploymentDeleteResponse } from './types';

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
