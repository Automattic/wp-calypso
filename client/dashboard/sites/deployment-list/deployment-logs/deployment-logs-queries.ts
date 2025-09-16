import { queryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export interface LogEntry {
	message: string;
	level: string;
	timestamp: string;
	context?: {
		command: {
			command_identifier: string;
			exit_code: number;
		};
	};
}

export interface LogEntryDetail {
	exit_code: number;
	stdout: Array< string >;
	stderr: Array< string >;
}

export const deploymentRunLogsQuery = ( siteId: number, deploymentId: number, runId: number ) =>
	queryOptions< LogEntry[] >( {
		queryKey: [ 'deployment-logs', siteId, deploymentId, runId ],
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }/runs/${ runId }/logs`,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		refetchOnWindowFocus: false,
		retry: false,
	} );

export const deploymentRunLogDetailQuery = (
	siteId: number,
	deploymentId: number,
	runId: number,
	commandIdentifier: string
) =>
	queryOptions< LogEntryDetail >( {
		queryKey: [ 'deployment-log-detail', siteId, deploymentId, runId, commandIdentifier ],
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }/runs/${ runId }/logs/${ commandIdentifier }`,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		refetchOnWindowFocus: false,
		retry: false,
	} );
