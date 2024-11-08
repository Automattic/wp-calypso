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
	command_identifier: string;
	exit_code: number;
}

export interface LogEntryDetail {
	exit_code: number;
	stdout: Array< string >;
	stderr: Array< string >;
}

export const useCodeDeploymentsRunLogQuery = (
	siteId: number | null,
	deploymentId: number,
	runId: number,
	options?: Partial< UseQueryOptions< LogEntry[] > >
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
export const useCodeDeploymentsRunLogDetailQuery = (
	siteId: number | null,
	deploymentId: number,
	runId: number,
	commandIdentifier: string | null,
	options?: Partial< UseQueryOptions< LogEntryDetail > >
) => {
	return useQuery< LogEntryDetail >( {
		enabled: !! siteId && !! commandIdentifier,
		queryKey: [
			GITHUB_DEPLOYMENTS_QUERY_KEY,
			CODE_DEPLOYMENTS_RUN_LOG_QUERY_KEY,
			siteId,
			deploymentId,
			runId,
			commandIdentifier,
		],
		queryFn: (): LogEntryDetail =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }/runs/${ runId }/logs/${ commandIdentifier }`,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		...options,
	} );
};
