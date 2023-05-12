import { useQuery } from '@tanstack/react-query';

async function requestZendeskConfig() {
	return await window.fetch( 'https://wpcom.zendesk.com/embeddable/config', {
		method: 'GET',
	} );
}

export default function useZendeskConfig() {
	return useQuery< Response >( [ 'getZendeskConfig' ], requestZendeskConfig, {
		staleTime: Infinity,
		retry: false,
		meta: {
			persist: false,
		},
	} );
}
