import { wpcom } from '../wpcom-fetcher';
import {
	CodeDeploymentDeleteResponse,
	CreateCodeDeploymentVariables,
	CreateCodeDeploymentResponse,
} from './types';

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

export async function createCodeDeployment(
	siteId: number,
	variables: CreateCodeDeploymentVariables
): Promise< CreateCodeDeploymentResponse > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/code-deployments`,
		apiNamespace: 'wpcom/v2',
		body: variables,
	} );
}
