/**
 * External dependencies
 */
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
/**
 * Internal dependencies
 */
import { isTestModeEnvironment } from './util';
import type { APIFetchOptions, MessagingAuth, ZendeskAuthType } from './types';

export const fetchMessagingAuth = async ( type: string = 'zendesk', initializeWidget = true ) => {
	const isTestMode = isTestModeEnvironment();
	const params = { type, test_mode: String( isTestMode ) };
	const wpcomParams = new URLSearchParams( params );

	const auth = await ( canAccessWpcomApis()
		? wpcomRequest< MessagingAuth >( {
				path: '/help/authenticate/chat',
				apiNamespace: 'wpcom/v2',
				query: wpcomParams.toString(),
				method: 'POST',
		  } )
		: apiFetch< MessagingAuth >( {
				path: addQueryArgs( '/help-center/authenticate/chat', params ),
				method: 'POST',
				global: true,
		  } as APIFetchOptions ) );

	const jwt = auth?.user?.jwt;

	if ( initializeWidget ) {
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
	}
	return { isLoggedIn: true, jwt, externalId: auth?.user.external_id };
};

export function useAuthenticateZendeskMessaging(
	enabled = false,
	type: ZendeskAuthType = 'zendesk',
	initializeWidget = true
) {
	const isTestMode = isTestModeEnvironment();
	return useQuery( {
		queryKey: [ 'getMessagingAuth', type, isTestMode, initializeWidget ],
		queryFn: async () => fetchMessagingAuth( type, initializeWidget ),
		staleTime: 7 * 24 * 60 * 60 * 1000, // 1 week (JWT is actually 2 weeks, but lets be on the safe side)
		enabled,
	} );
}
