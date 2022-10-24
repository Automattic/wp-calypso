import apiFetch from '@wordpress/api-fetch';
import { useQuery } from 'react-query';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { HappychatAuth } from './types';

export const happychatAuthQueryKey = 'getHappychatAuth-' + Date.now();

export async function requestHappyChatAuth() {
	return canAccessWpcomApis()
		? ( ( await wpcomRequest( {
				path: 'help/authenticate/chat',
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
		  } ) ) as HappychatAuth )
		: ( ( await apiFetch( {
				path: '/help-center/authenticate/chat',
		  } ) ) as HappychatAuth );
}

export default function useHappychatAuth( enabled = true ) {
	return useQuery< HappychatAuth >( happychatAuthQueryKey, requestHappyChatAuth, {
		staleTime: 10 * 60 * 1000, // 10 minutes
		enabled,
	} );
}
