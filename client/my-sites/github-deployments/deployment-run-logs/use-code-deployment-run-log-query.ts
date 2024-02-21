import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from '../constants';

export const CODE_DEPLOYMENTS_RUN_LOG_QUERY_KEY = 'code-deployments-run-log';

export interface LogEntry {
	message: string;
	level: string;
	timestamp: string;
	context?: Context;
}

export interface Context {
	command: Command;
}

export interface Command {
	command: string;
	exit_code: number;
	stdout: string;
	stderr: string;
}

export const useCodeDeploymentsRunLogQuery = (
	siteId: number | null,
	deploymentId: number,
	runId: number,
	options?: UseQueryOptions< LogEntry[] >
) => {
	return useQuery< LogEntry[] >( {
		enabled: !! siteId,
		queryKey: [
			GITHUB_DEPLOYMENTS_QUERY_KEY,
			CODE_DEPLOYMENTS_RUN_LOG_QUERY_KEY,
			siteId,
			deploymentId,
			runId,
		],
		queryFn: (): LogEntry[] =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }/runs/${ runId }/logs`,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		...options,
	} );
};
