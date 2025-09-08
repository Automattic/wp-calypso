import { wpcom } from '../wpcom-fetcher';
import type { CodeDeploymentData, DeploymentRun } from './types';

export async function fetchCodeDeployments( siteId: number ): Promise< CodeDeploymentData[] > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/code-deployments`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchCodeDeploymentRuns(
	siteId: number,
	deploymentId: number
): Promise< DeploymentRun[] > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }/runs`,
		apiNamespace: 'wpcom/v2',
	} );
}
