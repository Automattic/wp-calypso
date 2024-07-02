import config from '@automattic/calypso-config';
import { useQuery, QueryFunctionContext } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { MessagingAvailability } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export type MessagingGroup = 'jp_presales' | 'wpcom_messaging' | 'wpcom_presales';

function requestMessagingAvailability( { queryKey }: QueryFunctionContext ) {
	const currentEnvironment = config( 'env_id' );
	const [ , group ] = queryKey;
	const params = {
		group: group as string,
		environment: currentEnvironment === 'development' ? 'development' : 'production',
	};
	const wpcomParams = new URLSearchParams( params );
	return canAccessWpcomApis()
		? wpcomRequest< MessagingAvailability >( {
				path: '/help/support-status/messaging',
				query: wpcomParams.toString(),
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
				method: 'GET',
		  } )
		: apiFetch< MessagingAvailability >( {
				path: addQueryArgs( '/help-center/support-status/messaging', params ),
				method: 'GET',
				global: true,
		  } as APIFetchOptions );
}

export default function useMessagingAvailability( group: MessagingGroup, enabled = true ) {
	return useQuery< MessagingAvailability >( {
		queryKey: [ 'getMessagingAvailability', group ],
		queryFn: requestMessagingAvailability,
		staleTime: 60 * 1000, // 1 minute
		meta: {
			persist: false,
		},
		enabled,
	} );
}
