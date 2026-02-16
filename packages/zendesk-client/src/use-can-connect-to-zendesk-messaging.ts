import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from '@wordpress/element';

function fetchZendeskConfig() {
	// Parse the JSON to throw errors for all non-success responses
	return fetch( 'https://wpcom.zendesk.com/embeddable/config' ).then( ( res ) => res.json() );
}

// Track which dataUpdatedAt timestamps we've already recorded events for
// This persists across component mounts/unmounts
const trackedExecutions = new Set< number >();

/**
 * This hook verifies connectivity to Zendesk's messaging service by making a config request and manages automatic retries with error tracking.
 */
export function useCanConnectToZendeskMessaging( enabled = true ) {
	const query = useQuery< boolean, Error >( {
		queryKey: [ 'canConnectToZendesk' ],
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
		// Only track when query has completed (success or error)
		const isSettled = query.status === 'success' || query.status === 'error';
		const hasTracked = trackedExecutions.has( query.dataUpdatedAt );

		if ( ! isSettled || hasTracked || query.dataUpdatedAt === 0 ) {
			return;
		}

		trackedExecutions.add( query.dataUpdatedAt );

		// Leaving for backwards compatibility. This event is no longer needed. The one below is more general.
		if ( ! query.data && query.status === 'error' ) {
			recordTracksEvent( 'calypso_helpcenter_zendesk_config_error', {
				status: query.status,
				status_text: query.error?.message,
			} );
		}

		recordTracksEvent( 'calypso_helpcenter_zendesk_config_request', {
			status: query.status,
			status_text: query.error?.message,
			failure_count: query.failureCount,
		} );
	}, [ query.status, query.dataUpdatedAt, query.data, query.error?.message, query.failureCount ] );

	return query;
}
