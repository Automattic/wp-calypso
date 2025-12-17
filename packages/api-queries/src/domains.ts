import {
	type BulkDomainsAction,
	bulkDomainsAction,
	BulkDomainUpdateStatus,
	BulkDomainUpdateStatusResult,
	DomainUpdateStatus,
	fetchAvailableTlds,
	fetchBulkDomainUpdateStatus,
	fetchDomainSuggestions,
	fetchFreeDomainSuggestion,
	type JobStatus,
	type DomainSuggestionQuery,
} from '@automattic/api-core';
import { fetchDomains } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const domainsQuery = () =>
	queryOptions( {
		queryKey: [ 'domains' ],
		queryFn: fetchDomains,
	} );

export const domainSuggestionsQuery = (
	query: string,
	params: Partial< DomainSuggestionQuery > = {}
) =>
	queryOptions( {
		queryKey: [ 'domain-suggestions', query, params ],
		queryFn: () => fetchDomainSuggestions( query, params ),
		meta: { persist: false },
	} );

export const freeSuggestionQuery = (
	query: string,
	params: Partial< DomainSuggestionQuery > = {}
) =>
	queryOptions( {
		queryKey: [ 'free-suggestion', query, params ],
		queryFn: () => fetchFreeDomainSuggestion( query, params ),
	} );

export const availableTldsQuery = ( query?: string, vendor?: string ) =>
	queryOptions( {
		queryKey: [ 'available-tlds', query, vendor ],
		queryFn: () => fetchAvailableTlds( query, vendor ),
	} );

export const bulkDomainUpdateStatusQuery = () =>
	queryOptions( {
		queryKey: [ 'domains', 'bulk-actions' ],
		queryFn: fetchBulkDomainUpdateStatus,
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

			return { domainResults, completedJobs, allJobs };
		},
	} );

export const bulkDomainsActionMutation = () =>
	mutationOptions( {
		mutationFn: ( action: BulkDomainsAction ) => bulkDomainsAction( action ),
		onSuccess: () => {
			queryClient.refetchQueries( bulkDomainUpdateStatusQuery() );
		},
	} );
