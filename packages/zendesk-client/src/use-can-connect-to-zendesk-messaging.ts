import { useQuery } from '@tanstack/react-query';

export function useCanConnectToZendeskMessaging( enabled = true ) {
	return useQuery( {
		queryKey: [ 'canConnectToZendesk' ],
		queryFn: async () => {
			const config = await fetch( 'https://wpcom.zendesk.com/embeddable/config' );

			return config.ok;
		},
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
