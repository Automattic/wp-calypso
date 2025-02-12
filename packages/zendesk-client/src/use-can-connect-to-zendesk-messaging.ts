import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQuery } from '@tanstack/react-query';

async function fetchZendeskConfig(): Promise< boolean > {
	const config = await fetch( 'https://wpcom.zendesk.com/embeddable/config' );
	const validResponse = config.ok && config.status === 200;

	if ( ! validResponse ) {
		recordTracksEvent( 'calypso_helpcenter_zendesk_config_error', {
			status: config.status,
			statusText: config.statusText,
		} );
	}

	return validResponse;
}

export function useCanConnectToZendeskMessaging( enabled = true ) {
	return useQuery( {
		queryKey: [ 'canConnectToZendesk' ],
		queryFn: fetchZendeskConfig,
		staleTime: Infinity,
		retry: false,
		refetchOnMount: false,
		retryOnMount: false,
		refetchOnWindowFocus: false,
		refetchInterval: 180000,
		meta: {
			persist: false,
		},
		enabled,
	} );
}
