import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { MessagingAuth } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

async function requestMessagingAuth() {
	const currentEnvironment = config( 'env_id' );
	const params = { type: 'zendesk', test_mode: String( currentEnvironment === 'development' ) };
	const wpcomParams = new URLSearchParams( params );
	return canAccessWpcomApis()
		? ( ( await wpcomRequest( {
				path: '/help/authenticate/chat',
				query: wpcomParams.toString(),
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
				method: 'POST',
		  } ) ) as MessagingAuth )
		: ( ( await apiFetch( {
				path: addQueryArgs( '/help-center/authenticate/chat', params ),
				method: 'POST',
				global: true,
		  } as APIFetchOptions ) ) as MessagingAuth );
}

export default function useMessagingAuth( enabled: boolean ) {
	return useQuery< MessagingAuth >( [ 'getMessagingAuth' ], requestMessagingAuth, {
		staleTime: 10 * 60 * 1000, // 10 minutes
		meta: {
			persist: false,
		},
		enabled,
	} );
}
