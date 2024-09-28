/**
 * External dependencies
 */
import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
/**
 * Internal dependencies
 */
import type { APIFetchOptions, MessagingAuth, ZendeskAuthType } from './types';

let isLoggedIn = false;

export function useAuthenticateZendeskMessaging(
	enabled = true,
	type: ZendeskAuthType = 'zendesk'
) {
	const currentEnvironment = config( 'env_id' );
	const isTestMode = currentEnvironment === 'development';

	return useQuery( {
		queryKey: [ 'getMessagingAuth', type, isTestMode ],
		queryFn: () => {
			const params = { type, test_mode: String( isTestMode ) };
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
		},
		staleTime: 7 * 24 * 60 * 60 * 1000, // 1 week (JWT is actually 2 weeks, but lets be on the safe side)
		enabled,
		select: ( messagingAuth ) => {
			const jwt = messagingAuth?.user.jwt;
			if ( ! isLoggedIn ) {
				if ( typeof window.zE !== 'function' || ! jwt ) {
					return;
				}

				window.zE( 'messenger', 'loginUser', function ( callback ) {
					isLoggedIn = true;
					callback( jwt );
				} );
			}
			return { isLoggedIn, jwt, externalId: messagingAuth?.user.external_id };
		},
	} );
}
