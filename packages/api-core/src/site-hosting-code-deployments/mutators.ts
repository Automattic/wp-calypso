import { wpcom } from '../wpcom-fetcher';
import type { DeploymentRun } from './types';

export async function createCodeDeploymentRun(
	siteId: number,
	deploymentId: number
): Promise< DeploymentRun > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }/runs`,
		apiNamespace: 'wpcom/v2',
	} );
}
