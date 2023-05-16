import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { HappychatAuth } from './types';

export const happychatAuthQueryKey = [ 'getHappychatAuth' ];

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export async function requestHappyChatAuth( type?: string ) {
	const body = type ? { type } : undefined;
	return canAccessWpcomApis()
		? ( ( await wpcomRequest( {
				path: '/help/authenticate/chat',
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
				method: 'POST',
				body,
		  } ) ) as HappychatAuth )
		: ( ( await apiFetch( {
				path: '/help-center/authenticate/chat',
				method: 'POST',
				global: true,
				body,
		  } as APIFetchOptions ) ) as HappychatAuth );
}

export default function useHappychatAuth( enabled = true, type?: string ) {
	return useQuery< HappychatAuth >( happychatAuthQueryKey, () => requestHappyChatAuth( type ), {
		staleTime: 10 * 60 * 1000, // 10 minutes
		enabled,
		meta: {
			persist: false,
		},
	} );
}
