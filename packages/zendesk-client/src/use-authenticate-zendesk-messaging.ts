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

/**
 * Bump me when the API response structure goes through a breaking change.
 */
const VERSION = 'v2';

export function useAuthenticateZendeskMessaging(
	enabled = false,
	type: ZendeskAuthType = 'zendesk'
) {
	const currentEnvironment = config( 'env_id' ) as string;
	const isTestMode = ! [ 'production', 'desktop' ].includes( currentEnvironment );

	return useQuery( {
		queryKey: [ 'getMessagingAuth', VERSION, type, isTestMode ],
		queryFn: async () => {
			const params = { type, test_mode: String( isTestMode ) };
			const wpcomParams = new URLSearchParams( params );

			const auth = await ( canAccessWpcomApis()
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
				  } as APIFetchOptions ) );

			const jwt = auth?.user?.jwt;

			return new Promise< { isLoggedIn: boolean; jwt: string; externalId: string | undefined } >(
				( resolve, reject ) => {
					if ( ! jwt ) {
						reject();
					}
					window?.zE?.( 'messenger', 'loginUser', function ( callback ) {
						callback( jwt );
						resolve( { isLoggedIn: true, jwt, externalId: auth?.user.external_id } );
					} );
				}
			);
		},
		staleTime: 7 * 24 * 60 * 60 * 1000, // 1 week (JWT is actually 2 weeks, but lets be on the safe side)
		enabled,
	} );
}
