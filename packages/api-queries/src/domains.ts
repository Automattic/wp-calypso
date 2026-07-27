import {
	type BulkDomainsAction,
	bulkDomainsAction,
	BulkDomainUpdateStatus,
	BulkDomainUpdateStatusResult,
	DomainUpdateStatus,
	fetchAvailableTlds,
	fetchBulkDomainUpdateStatus,
	fetchBundleForDomain,
	fetchBundleMetadata,
	fetchDomains,
	fetchDomainSuggestions,
	fetchFreeDomainSuggestion,
	type BundleMetadata,
	type FetchDomainsOptions,
	type JobStatus,
	type DomainSuggestionQuery,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const domainsQuery = ( options?: FetchDomainsOptions ) =>
	queryOptions( {
		queryKey: [ 'domains', options ],
		queryFn: () => fetchDomains( options ),
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
		meta: { persist: false },
	} );

// One request, two typed views. `bundle_suggestion` (top BundleCard) and
// `bundle_triggers` (inline-bundle catalogue) both come from the same
// `with_bundles=1` `/domains/suggestions` call, so they share a query key and
// React Query dedupes them to a single network request even when both consumers
// are enabled on the same query. The two exports below spread this query and add
// a `select` picking their half of the response.
export const bundleMetadataQuery = ( query: string ) =>
	queryOptions( {
		queryKey: [ 'domain-bundle-metadata', query ],
		queryFn: () => fetchBundleMetadata( query ),
		meta: { persist: false },
	} );

// Module-level selectors so React Query sees a stable `select` reference across
// renders instead of a fresh closure per call.
const selectBundleSuggestion = ( data: BundleMetadata ) => data.bundle_suggestion;
const selectBundleTriggers = ( data: BundleMetadata ) => data.bundle_triggers;

export const bundleSuggestionQuery = ( query: string ) => ( {
	...bundleMetadataQuery( query ),
	select: selectBundleSuggestion,
} );

export const bundleTriggersQuery = ( query: string ) => ( {
	...bundleMetadataQuery( query ),
	select: selectBundleTriggers,
} );

export const bundleForDomainQuery = ( fqdn: string ) =>
	queryOptions( {
		queryKey: [ 'bundle-for-domain', fqdn ],
		queryFn: () => fetchBundleForDomain( fqdn ),
		meta: { persist: false },
	} );

export const availableTldsQuery = ( query?: string, vendor?: string ) =>
	queryOptions( {
		queryKey: [ 'available-tlds', query, vendor ],
		queryFn: () => fetchAvailableTlds( query, vendor ),
		meta: { persist: false },
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
		meta: { statId: 'domains-bulk-apply' },
		mutationFn: ( action: BulkDomainsAction ) => bulkDomainsAction( action ),
		onSuccess: () => {
			queryClient.refetchQueries( bulkDomainUpdateStatusQuery() );
		},
	} );
