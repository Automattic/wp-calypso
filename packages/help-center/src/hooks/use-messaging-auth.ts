import config from '@automattic/calypso-config';
import { useQuery, QueryFunctionContext } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { MessagingAuth } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

let isLoggedIn = false;

function requestMessagingAuth( { queryKey }: QueryFunctionContext ) {
	const [ , isTestMode ] = queryKey;
	const params = { type: 'zendesk', test_mode: String( isTestMode ) };
	const wpcomParams = new URLSearchParams( params );
	return canAccessWpcomApis()
		? wpcomRequest< MessagingAuth >( {
				path: '/help/authenticate/chat',
				query: wpcomParams.toString(),
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
				method: 'POST',
		  } )
		: apiFetch< MessagingAuth >( {
				path: addQueryArgs( '/help-center/authenticate/chat', params ),
				method: 'POST',
				global: true,
		  } as APIFetchOptions );
}

export default function useMessagingAuth( enabled: boolean ) {
	const currentEnvironment = config( 'env_id' );
	const isTestMode = currentEnvironment === 'development';
	return useQuery( {
		queryKey: [ 'getMessagingAuth', isTestMode ],
		queryFn: requestMessagingAuth,
		staleTime: 7 * 24 * 60 * 60 * 1000, // 1 week (JWT is actually 2 weeks, but lets be on the safe side)
		enabled,
		select: ( messagingAuth ) => {
			if ( ! isLoggedIn ) {
				const jwt = messagingAuth?.user.jwt;
				if ( typeof window.zE !== 'function' || ! jwt ) {
					return;
				}

				window.zE( 'messenger', 'loginUser', function ( callback ) {
					isLoggedIn = true;
					callback( jwt );
				} );
			}
			return { isLoggedIn };
		},
	} );
}
