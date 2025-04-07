import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

export interface BulkDomainUpdateStatus {
	results: {
		[ key: string ]: '' | 'success' | 'failed';
	};
	action: 'set_auto_renew' | 'update_contact_info';
	created_at: number;
	auto_renew?: boolean;
	whois?: unknown;
	transfer_lock?: boolean;
}

export interface BulkDomainUpdateStatusQueryFnData {
	[ key: string ]: BulkDomainUpdateStatus;
}

export interface JobStatus {
	id: string;
	action: 'set_auto_renew' | 'update_contact_info';
	created_at: number;
	success: string[];
	failed: string[];
	pending: string[];
	complete: boolean;
	params: {
		auto_renew?: boolean;
		whois?: unknown;
		transfer_lock?: boolean;
	};
}

interface DomainUpdateRemoteStatus {
	status: '' | 'success' | 'failed';
	action: 'set_auto_renew' | 'update_contact_info';
	created_at: number;
	auto_renew?: boolean;
	whois?: unknown;
	transfer_lock?: boolean;
}

interface DomainUpdateDerivedStatus {
	status: '';
	message: string;
	created_at: number;
}

export type DomainUpdateStatus = DomainUpdateRemoteStatus | DomainUpdateDerivedStatus;

export const getBulkDomainUpdateStatusQueryKey = () => {
	return [ 'domains', 'bulk-actions' ];
};

export interface BulkDomainUpdateStatusResult {
	domainResults: Map< string, DomainUpdateStatus[] >;
	completedJobs: JobStatus[];
}

export function useBulkDomainUpdateStatusQuery< TError = unknown >(
	pollingInterval: number,
	options: Omit<
		UseQueryOptions< BulkDomainUpdateStatusQueryFnData, TError, BulkDomainUpdateStatusResult >,
		'queryKey'
	> = {}
) {
	return useQuery( {
		queryFn: () =>
			wpcomRequest< BulkDomainUpdateStatusQueryFnData >( {
				path: '/domains/bulk-actions',
				apiNamespace: 'wpcom/v2',
			} ),
		select: ( data ): BulkDomainUpdateStatusResult => {
			// get top-level info about recent jobs
			const allJobs: JobStatus[] = Object.keys( data ).map( ( jobId ) => {
				const { action, created_at, results, ...rest } = data[ jobId ];
				const success: string[] = [];
				const failed: string[] = [];
				const pending: string[] = [];

				Object.entries( results ).forEach( ( entry ) => {
					if ( entry[ 1 ] === 'success' ) {
						success.push( entry[ 0 ] );
					} else if ( entry[ 1 ] === 'failed' ) {
						failed.push( entry[ 0 ] );
					} else {
						pending.push( entry[ 0 ] );
					}
				} );

				return {
					id: jobId,
					action: action,
					created_at: created_at,
					success,
					failed,
					pending,
					complete: pending.length === 0,
					params: rest,
				};
			} );

			// get domain-level updates that can be shown inline in the table rows
			const domainResults = new Map< string, DomainUpdateStatus[] >();

			Object.keys( data ).forEach( ( jobId ) => {
				// only create domain-level results for jobs that
				// are still running
				if ( ! allJobs.find( ( job ) => job.id === jobId )?.complete ) {
					const entry = data[ jobId ] as BulkDomainUpdateStatus;
					const { results, ...rest } = entry;
					Object.keys( results ).forEach( ( domain ) => {
						if ( ! domainResults.has( domain ) ) {
							domainResults.set( domain, [] );
						}
						const status = results[ domain ];
						domainResults.get( domain )?.push( { ...rest, status } );
					} );
				}
			} );

			const completedJobs = allJobs.filter( ( job ) => job.complete );

			return { domainResults, completedJobs };
		},
		refetchInterval: pollingInterval,
		...options,
		queryKey: getBulkDomainUpdateStatusQueryKey(),
	} );
}
