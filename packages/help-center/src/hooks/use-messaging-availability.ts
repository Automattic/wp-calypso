import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { MessagingAvailability } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

async function requestMessagingAvailability() {
	const params = new URLSearchParams( { group: 'wpcom_messaging', environment: 'production' } );
	return canAccessWpcomApis()
		? ( ( await wpcomRequest( {
				path: '/help/messaging/is-available',
				query: params.toString(),
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
				method: 'GET',
		  } ) ) as MessagingAvailability )
		: ( ( await apiFetch( {
				path: '/help-center/messaging/is-available',
				query: params.toString(),
				method: 'GET',
				global: true,
		  } as APIFetchOptions ) ) as MessagingAvailability );
}

export default function useMessagingAvailability( enabled = true ) {
	return useQuery< MessagingAvailability >(
		[ 'getMessagingAvailability' ],
		requestMessagingAvailability,
		{
			staleTime: 60 * 1000, // 1 minute
			meta: {
				persist: false,
			},
			enabled,
		}
	);
}
