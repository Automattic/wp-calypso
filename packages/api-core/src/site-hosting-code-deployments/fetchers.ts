import { wpcom } from '../wpcom-fetcher';
import type { CodeDeploymentData, DeploymentRun, LogEntry, LogEntryDetail } from './types';

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

export async function fetchCodeDeploymentRunLogs(
	siteId: number,
	deploymentId: number,
	runId: number
): Promise< LogEntry[] > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }/runs/${ runId }/logs`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchCodeDeploymentRunLogDetail(
	siteId: number,
	deploymentId: number,
	runId: number,
	commandIdentifier: string
): Promise< LogEntryDetail > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }/runs/${ runId }/logs/${ commandIdentifier }`,
		apiNamespace: 'wpcom/v2',
	} );
}
