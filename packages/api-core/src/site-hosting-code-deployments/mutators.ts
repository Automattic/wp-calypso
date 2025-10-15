import { wpcom } from '../wpcom-fetcher';
import {
	CodeDeploymentDeleteResponse,
	CreateAndUpdateCodeDeploymentVariables,
	CreateAndUpdateCodeDeploymentResponse,
	DeploymentRun,
} from './types';

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

export async function createCodeDeployment(
	siteId: number,
	variables: CreateAndUpdateCodeDeploymentVariables
): Promise< CreateAndUpdateCodeDeploymentResponse > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/code-deployments`,
		apiNamespace: 'wpcom/v2',
		body: variables,
	} );
}

export async function updateCodeDeployment(
	siteId: number,
	deploymentId: number,
	variables: CreateAndUpdateCodeDeploymentVariables
): Promise< CreateAndUpdateCodeDeploymentResponse > {
	return wpcom.req.put( {
		path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }`,
		apiNamespace: 'wpcom/v2',
		body: variables,
	} );
}
