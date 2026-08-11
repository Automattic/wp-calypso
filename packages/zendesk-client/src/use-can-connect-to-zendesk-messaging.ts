import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from '@wordpress/element';
import type { Query } from '@tanstack/react-query';

const QUERY_KEY = [ 'canConnectToZendesk' ];

/**
 * Bump when the meaning of the events below changes, so Superset can tell old rows from new
 * ones. Version 2 reports once per settled query instead of once per observer per state.
 */
const REPORTING_VERSION = 2;

type ReportingState = {
	lastResolutionKey?: string;
	peakFailureCount: number;
};

/**
 * Keyed on the cached query rather than the client, so the state dies with the query it
 * describes. An evicted query comes back as a fresh instance whose update counters restart
 * at zero, and reusing the old state would read that as a repeat and stay silent.
 *
 * Module-scoped because every observer of one query has to share it; a ref would be
 * per-component, which is the duplication this guards against.
 */
const reportingStates = new WeakMap< Query, ReportingState >();

function getReportingState( cachedQuery: Query ): ReportingState {
	let state = reportingStates.get( cachedQuery );

	if ( ! state ) {
		state = { peakFailureCount: 0 };
		reportingStates.set( cachedQuery, state );
	}

	return state;
}

function fetchZendeskConfig() {
	// Parse the JSON to throw errors for all non-success responses
	return fetch( 'https://wpcom.zendesk.com/embeddable/config' ).then( ( res ) => res.json() );
}

/**
 * This hook verifies connectivity to Zendesk's messaging service by making a config request and manages automatic retries with error tracking.
 */
export function useCanConnectToZendeskMessaging( enabled = true ) {
	const queryClient = useQueryClient();
	const query = useQuery< boolean, Error >( {
		queryKey: QUERY_KEY,
		queryFn: fetchZendeskConfig,
		staleTime: Infinity,
		// Retry 3 times with a 1 second delay between each retry
		retry: 3,
		retryDelay: 1000,
		refetchOnMount: false,
		retryOnMount: false,
		refetchOnWindowFocus: false,
		meta: {
			persist: false,
		},
		enabled,
		// Cast down to boolean.
		select: ( data ) => !! data,
	} );

	useEffect( () => {
		const cachedQuery = queryClient.getQueryCache().find( { queryKey: QUERY_KEY } );

		if ( ! cachedQuery ) {
			return;
		}

		const reportingState = getReportingState( cachedQuery );

		if ( query.fetchStatus !== 'idle' ) {
			// A success resets `failureCount` to 0, so retries that ended in recovery are only
			// visible while the fetch is still running. A refetch over cached data keeps
			// `status` at 'success' throughout, which is why this tracks `fetchStatus`.
			reportingState.peakFailureCount = Math.max(
				reportingState.peakFailureCount,
				query.failureCount
			);
		}

		if ( query.status === 'pending' ) {
			return;
		}

		// The update counters are per-query and monotonic. Timestamps are neither: two
		// resolutions inside one millisecond collapse, and `errorUpdatedAt` is recomputed per
		// observer whenever `select` throws.
		const { dataUpdateCount, errorUpdateCount } = cachedQuery.state;
		const resolutionKey = `${ query.status }:${ dataUpdateCount }:${ errorUpdateCount }`;

		if ( reportingState.lastResolutionKey === resolutionKey ) {
			return;
		}

		reportingState.lastResolutionKey = resolutionKey;

		const failureCount = Math.max( reportingState.peakFailureCount, query.failureCount );
		reportingState.peakFailureCount = 0;

		// Leaving for backwards compatibility. This event is no longer needed. The one below is more general.
		if ( ! query.data ) {
			recordTracksEvent( 'calypso_helpcenter_zendesk_config_error', {
				status: query.status,
				status_text: query.error?.message,
				reporting_version: REPORTING_VERSION,
			} );
		}

		recordTracksEvent( 'calypso_helpcenter_zendesk_config_request', {
			status: query.status,
			status_text: query.error?.message,
			failure_count: failureCount,
			reporting_version: REPORTING_VERSION,
		} );
	}, [
		query.data,
		query.dataUpdatedAt,
		query.error?.message,
		query.errorUpdatedAt,
		query.failureCount,
		query.fetchStatus,
		query.status,
		queryClient,
	] );

	return query;
}
