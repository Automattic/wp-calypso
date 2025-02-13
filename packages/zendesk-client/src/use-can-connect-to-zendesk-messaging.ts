import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from '@wordpress/element';

async function fetchZendeskConfig(): Promise< boolean > {
	const config = await fetch( 'https://wpcom.zendesk.com/embeddable/config' );
	const validResponse = config.ok && config.status === 200;

	return validResponse;
}

export function useCanConnectToZendeskMessaging( enabled = true ) {
	const queryClient = useQueryClient();
	const [ shouldRefetch, setShouldRefetch ] = useState( false );

	const query = useQuery< boolean, Error >( {
		queryKey: [ 'canConnectToZendesk' ],
		queryFn: fetchZendeskConfig,
		staleTime: Infinity,
		retry: false,
		refetchOnMount: false,
		retryOnMount: false,
		refetchOnWindowFocus: false,
		refetchInterval: shouldRefetch ? 60000 : false,
		meta: {
			persist: false,
		},
		enabled,
	} );

	useEffect( () => {
		if ( query.isSuccess ) {
			setShouldRefetch( false );
		} else {
			setShouldRefetch( true );
			queryClient.invalidateQueries( { queryKey: [ 'canConnectToZendesk' ] } );
		}
	}, [ query.isSuccess, queryClient ] );

	useEffect( () => {
		if ( ! query.data ) {
			recordTracksEvent( 'calypso_helpcenter_zendesk_config_error', {
				status: query.status,
				statusText: query.error?.message,
			} );
		}
	}, [ query.data, query.error?.message, query.status ] );

	return query;
}
