import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { MessagingAvailability } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

function requestMessagingAvailability() {
	const currentEnvironment = config( 'env_id' );
	const params = {
		group: 'wpcom_messaging',
		environment: currentEnvironment === 'development' ? 'development' : 'production',
	};
	const wpcomParams = new URLSearchParams( params );
	return canAccessWpcomApis()
		? wpcomRequest< MessagingAvailability >( {
				path: '/help/messaging/is-available',
				query: wpcomParams.toString(),
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
				method: 'GET',
		  } )
		: apiFetch< MessagingAvailability >( {
				path: addQueryArgs( '/help-center/support-availability/messaging', params ),
				method: 'GET',
				global: true,
		  } as APIFetchOptions );
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
