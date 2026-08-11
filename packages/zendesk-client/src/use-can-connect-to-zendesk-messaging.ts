import { recordTracksEvent } from '@automattic/calypso-analytics';
import { hashKey, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from '@wordpress/element';
import type { QueryClient } from '@tanstack/react-query';

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
 * Module-scoped because every observer of the same query has to share it. A ref would be
 * per-component, which is the duplication this guards against.
 */
const reportingStates = new WeakMap< QueryClient, Map< string, ReportingState > >();

function getReportingState( queryClient: QueryClient, queryKeyHash: string ): ReportingState {
	let byQueryKey = reportingStates.get( queryClient );

	if ( ! byQueryKey ) {
		byQueryKey = new Map();
		reportingStates.set( queryClient, byQueryKey );
	}

	let state = byQueryKey.get( queryKeyHash );

	if ( ! state ) {
		state = { peakFailureCount: 0 };
		byQueryKey.set( queryKeyHash, state );
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
		const reportingState = getReportingState( queryClient, hashKey( QUERY_KEY ) );

		if ( query.status === 'pending' ) {
			// A success resets `failureCount` to 0, so retries that ended in recovery are only
			// visible while the query is still in flight.
			reportingState.peakFailureCount = Math.max(
				reportingState.peakFailureCount,
				query.failureCount
			);
			return;
		}

		// The update counters are per-query and monotonic. Timestamps are neither: two
		// resolutions inside one millisecond collapse, and `errorUpdatedAt` is recomputed per
		// observer whenever `select` throws.
		const queryState = queryClient.getQueryState( QUERY_KEY );
		const resolutionKey = `${ query.status }:${ queryState?.dataUpdateCount ?? 0 }:${
			queryState?.errorUpdateCount ?? 0
		}`;

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
		query.status,
		queryClient,
	] );

	return query;
}
