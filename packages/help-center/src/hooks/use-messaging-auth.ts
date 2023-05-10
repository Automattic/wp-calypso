import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { MessagingAuth } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

async function requestMessagingAuth() {
	const params = new URLSearchParams( { type: 'zendesk' } );
	return canAccessWpcomApis()
		? ( ( await wpcomRequest( {
				path: '/help/authenticate/chat',
				query: params.toString(),
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
				method: 'POST',
		  } ) ) as MessagingAuth )
		: ( ( await apiFetch( {
				path: '/help-center/authenticate/chat',
				query: params.toString(),
				method: 'POST',
				global: true,
		  } as APIFetchOptions ) ) as MessagingAuth );
}

export default function useMessagingAuth() {
	return useQuery< MessagingAuth >( [ 'getMessagingAuth' ], requestMessagingAuth, {
		staleTime: 10 * 60 * 1000, // 10 minutes
		meta: {
			persist: false,
		},
	} );
}
