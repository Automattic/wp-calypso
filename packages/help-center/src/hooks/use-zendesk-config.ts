import { useQuery } from '@tanstack/react-query';

async function requestZendeskConfig() {
	return await window.fetch( 'https://wpcom.zendesk.com/embeddable/config', {
		method: 'GET',
	} );
}

export default function useZendeskConfig( enabled: boolean ) {
	return useQuery< Response >( [ 'getZendeskConfig' ], requestZendeskConfig, {
		staleTime: Infinity,
		retry: false,
		meta: {
			persist: false,
		},
		enabled,
	} );
}
