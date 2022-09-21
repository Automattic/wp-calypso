import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

export function useIsProxied( enabled = true ) {
	return useQuery< {
		is_proxied: '';
	} >(
		'is-user-proxied',
		() => wpcomRequest( { path: '/am-i/proxied', apiNamespace: 'wpcom/v2' } ),
		{
			refetchOnWindowFocus: false,
			staleTime: Infinity,
			enabled,
		}
	);
}
