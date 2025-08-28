import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from '@wordpress/element';

function fetchZendeskConfig() {
	// Parse the JSON to throw errors for all non-success responses
	return fetch( 'https://wpcom.zendesk.com/embeddable/config' ).then( ( res ) => res.json() );
}

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
		// Leaving for backwards compatibility. This event is no longer needed. The one below is more general.
		if ( ! query.data && query.status !== 'pending' ) {
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
	}, [ query.data, query.error?.message, query.status, query.failureCount ] );

	return query;
}
