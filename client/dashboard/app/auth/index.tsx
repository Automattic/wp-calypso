import { fetchUser, isWpError, User } from '@automattic/api-core';
import { clearQueryClient, disablePersistQueryClient } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { setUser } from '@automattic/calypso-sentry';
import { isSupportUserSession } from '@automattic/calypso-support-session';
import { magnificentNonEnLocales } from '@automattic/i18n-utils';
import {
	useQuery,
	useQueryClient,
	type QueryCacheNotifyEvent,
	type MutationCacheNotifyEvent,
} from '@tanstack/react-query';
import { createContext, useContext, useMemo, useEffect, useRef, useCallback } from 'react';
import { OAUTH_CALLBACK_PATH } from './oauth-callback';
import type { WPError } from '@automattic/api-core';

export const AUTH_QUERY_KEY = [ 'auth', 'user' ];

function getOAuthAuthorizeUrl( {
	state,
	next = '',
	isLogout = false,
}: {
	state: string;
	next?: string;
	isLogout?: boolean;
} ): string {
	const redirectUri = new URL( OAUTH_CALLBACK_PATH, window.location.origin );

	if ( next ) {
		redirectUri.search = new URLSearchParams( { next } ).toString();
	}

	const authUri = new URL( 'https://public-api.wordpress.com/oauth2/authorize' );
	authUri.search = new URLSearchParams( {
		response_type: 'token',
		client_id: String( config( 'oauth_client_id' ) ),
		redirect_uri: redirectUri.toString(),
		scope: 'global',
		blog_id: '0',
		state,
		...( isLogout === true ? { implicit: 'false' } : {} ),
	} ).toString();

	return authUri.toString();
}

interface AuthContextType {
	user: User;
	logout: () => Promise< void >;
}
export const AuthContext = createContext< AuthContextType | undefined >( undefined );

async function initializeCurrentUser(): Promise< User > {
	// In support user session the `currentUser` refers to the wrong person so we should request
	// the user object. Note we do not check `isSupportNextSession()` because in "next" support
	// sessions the server does bootstrap the correct `currentUser`.
	const useBootstrap = ! isSupportUserSession() && config.isEnabled( 'wpcom-user-bootstrap' );

	if ( useBootstrap ) {
		if ( window.currentUser ) {
			return window.currentUser;
		}
		throw new Error( 'Failed to bootstrap user object' );
	}

	return fetchUser();
}

/**
 * This component:
 * 1. Fetches and provides auth data via context
 * 2. Handles authentication checking
 * 3. Shows nothing during loading (falls back to the HTML loading screen)
 * 4. Redirects to login if unauthorized
 */
export function AuthProvider( { children }: { children: React.ReactNode } ) {
	const authErrorHandled = useRef( false );
	const queryClient = useQueryClient();
	const {
		data: user,
		isLoading: userIsLoading,
		isError: userIsError,
	} = useQuery( {
		queryKey: AUTH_QUERY_KEY,
		queryFn: initializeCurrentUser,
		staleTime: 30 * 60 * 1000, // Consider auth valid for 30 minutes
		retry: false, // Don't retry on 401 errors
		meta: {
			persist: false,
		},
	} );

	const value = useMemo( () => {
		if ( ! user ) {
			return undefined;
		}

		return {
			user,
			logout: () => logout( user ),
		};
	}, [ user ] );

	const handleAuthError = useCallback( () => {
		// Prevents repeated calls to redirect
		if ( authErrorHandled.current ) {
			return;
		}

		authErrorHandled.current = true;

		if ( config.isEnabled( 'oauth' ) ) {
			const state = crypto.randomUUID();
			sessionStorage.setItem( 'wpcom_oauth_state', state );

			window.location.replace(
				getOAuthAuthorizeUrl( {
					state,
					next: window.location.pathname + window.location.search,
				} )
			);
			return;
		}

		const currentPath = window.location.href;
		const path = config( 'wpcom_login_url' ) || '/log-in';
		const loginUrl = `${ path }?redirect_to=${ encodeURIComponent( currentPath ) }`;
		window.location.href = loginUrl;
	}, [] );

	// Subscribe to network errors and when errors occur due to being logged
	// out, redirect the user to the log in screen.
	useEffect( () => {
		const isAuthError = ( { statusCode, error = '' }: WPError ) => {
			if ( [ 'authorization_required' ].includes( error ) ) {
				return true;
			}

			if ( statusCode === 401 && error === 'rest_forbidden' ) {
				return true;
			}

			return false;
		};

		const handleEvent = ( event: MutationCacheNotifyEvent | QueryCacheNotifyEvent ) => {
			if (
				event.type === 'updated' &&
				event.action.type === 'error' &&
				isWpError( event.action.error ) &&
				isAuthError( event.action.error )
			) {
				handleAuthError();
			}
		};
		const unsubMutationCache = queryClient.getMutationCache().subscribe( handleEvent );
		const unsubQueryCache = queryClient.getQueryCache().subscribe( handleEvent );
		return () => {
			unsubMutationCache();
			unsubQueryCache();
		};
	}, [ queryClient, handleAuthError ] );

	useEffect( () => {
		if ( user?.ID ) {
			setUser( { id: user.ID.toString() } );
		}
	}, [ user ] );

	// Handles _all_ errors fetching the user object, regardless of whether they are
	// `authorization_required` errors or not.
	if ( userIsError ) {
		if ( typeof window !== 'undefined' ) {
			handleAuthError();
		}
		return null;
	}

	if ( userIsLoading || ! user ) {
		return null;
	}

	return <AuthContext.Provider value={ value }>{ children }</AuthContext.Provider>;
}

export async function logout( user: User ): Promise< void > {
	let configLogoutUrl = config( 'logout_url' ) as string | false;

	// Apply locale subdomain to static logout URLs (e.g., |subdomain|wordpress.com)
	if ( configLogoutUrl ) {
		const subdomain = magnificentNonEnLocales.includes( user.language ) ? user.language + '.' : '';
		configLogoutUrl = configLogoutUrl.replace( '|subdomain|', subdomain );
	}

	// Determine where to send the user after logout. Priority:
	//
	// 1. OAuth dashboards with no static logout_url: redirect through the
	//    OAuth flow with implicit=false, allowing the user to switch accounts.
	// 2. always_use_logout_url: force the static logout_url from config,
	//    ignoring the user's API-provided logout URL.
	// 3. user.logout_URL: the WP.com logout URL from the /me API response.
	// 4. Fallback: the static logout_url from config, or the dashboard root.
	let logoutUrl = '';
	if ( config.isEnabled( 'oauth' ) && ! configLogoutUrl ) {
		const state = crypto.randomUUID();
		sessionStorage.setItem( 'wpcom_oauth_state', state );

		logoutUrl = getOAuthAuthorizeUrl( { state, isLogout: true } );
	} else if ( config.isEnabled( 'always_use_logout_url' ) && configLogoutUrl ) {
		logoutUrl = configLogoutUrl;
	} else if ( user.logout_URL ) {
		logoutUrl = user.logout_URL;
	} else {
		logoutUrl = configLogoutUrl || window.location.origin;
	}

	disablePersistQueryClient();
	clearQueryClient();

	// Dynamically import Calypso v1 cleanup code because it includes a number
	// of dependencies we don't want included in the Hosting Dashboard bundle.
	const { disablePersistence, clearStore } = await import( 'calypso/lib/user/store' );
	disablePersistence();
	clearStore();

	window.location.href = logoutUrl;
}

/**
 * Custom hook to access auth context
 * The user is guaranteed to be available
 */
export function useAuth(): AuthContextType {
	const context = useContext( AuthContext );
	if ( context === undefined ) {
		throw new Error( 'useAuth must be used within an AuthProvider' );
	}
	return context;
}
