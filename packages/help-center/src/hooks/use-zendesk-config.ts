import { useQuery } from '@tanstack/react-query';

function requestZendeskConfig() {
	return window.fetch( 'https://wpcom.zendesk.com/embeddable/config' );
}

export default function useZendeskConfig( enabled: boolean ) {
	return useQuery( [ 'getZendeskConfig' ], requestZendeskConfig, {
		staleTime: Infinity,
		retry: false,
		refetchOnMount: false,
		retryOnMount: false,
		refetchOnWindowFocus: false,
		meta: {
			persist: false,
		},
		enabled,
	} );
}
