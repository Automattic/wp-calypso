import { fetchUser, isWpError, User } from '@automattic/api-core';
import { clearQueryClient, disablePersistQueryClient } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { setUser } from '@automattic/calypso-sentry';
import { isSupportUserSession } from '@automattic/calypso-support-session';
import { magnificentNonEnLocales } from '@automattic/i18n-utils';
import {
	hashKey,
	useQuery,
	useQueryClient,
	type QueryCacheNotifyEvent,
	type MutationCacheNotifyEvent,
} from '@tanstack/react-query';
import { createContext, useContext, useMemo, useEffect, useRef, useCallback } from 'react';
import { wpcomLink } from '../../utils/link';
import { bumpStat } from '../analytics';
import { useAppContext } from '../context';
import { OAUTH_CALLBACK_PATH } from './oauth-callback';
import type { WPError } from '@automattic/api-core';

export const AUTH_QUERY_KEY = [ 'auth', 'user' ];

const BOOTSTRAP_ERROR_MESSAGE = 'Failed to bootstrap user object';

const AUTH_BOUNCE_COUNT_KEY = 'wpcom_auth_bounce_count';

const AUTH_LOOP_WINDOW_MS = 30 * 1000;

// Cap the reported loop count (reported as "10+") so a runaway loop can't
// inflate stat cardinality.
const AUTH_LOOP_MAX_COUNT = 10;

interface AuthBounceRecord {
	count: number;
	at: number;
}

// bumpStat when we have a login redirect loop.
// We track the time of the last bounce, and if it was within a window we count
// it towards our loop count. This is more reliable than clearing the counter on
// successful auth, because how do we know when it is safe to clear the count?
// It could be that immediately after successful auth, the very next API returns
// 401 and causes a bounce, yet we would have already cleared the count.
function trackAuthBounceLoop() {
	try {
		const now = Date.now();
		const storedRecord: unknown = JSON.parse(
			window.sessionStorage.getItem( AUTH_BOUNCE_COUNT_KEY ) ?? 'null'
		);
		const previousRecord = isAuthBounceRecord( storedRecord ) ? storedRecord : null;
		const withinWindow = previousRecord !== null && now - previousRecord.at < AUTH_LOOP_WINDOW_MS;
		const count = withinWindow ? previousRecord.count + 1 : 1;

		window.sessionStorage.setItem(
			AUTH_BOUNCE_COUNT_KEY,
			JSON.stringify( { count, at: now } satisfies AuthBounceRecord )
		);

		if ( count >= 2 ) {
			const value = count >= AUTH_LOOP_MAX_COUNT ? `${ AUTH_LOOP_MAX_COUNT }+` : String( count );
			bumpStat( 'dashboard-auth-loop', value );
		}
	} catch {
		// sessionStorage can be unavailable in private contexts or JSON.parse may fail.
	}
}

function isAuthBounceRecord( value: unknown ): value is AuthBounceRecord {
	return (
		typeof value === 'object' &&
		value !== null &&
		'count' in value &&
		typeof value.count === 'number' &&
		'at' in value &&
		typeof value.at === 'number'
	);
}

function getOAuthAuthorizeUrl( {
	state,
	next = '',
	isLogout = false,
	isNewUser = false,
}: {
	state: string;
	next?: string;
	isLogout?: boolean;
	isNewUser?: boolean;
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
		...( isNewUser === true ? { 'new-user': '1' } : {} ),
	} ).toString();

	return authUri.toString();
}

interface AuthContextType {
	user: User;
	logout: () => Promise< void >;
}
export const AuthContext = createContext< AuthContextType | undefined >( undefined );

function shouldUseBootstrap(): boolean {
	// In support user session the `currentUser` refers to the wrong person so we should request
	// the user object. Note we do not check `isSupportNextSession()` because in "next" support
	// sessions the server does bootstrap the correct `currentUser`.
	return ! isSupportUserSession() && config.isEnabled( 'wpcom-user-bootstrap' );
}

export async function initializeCurrentUser(): Promise< User > {
	if ( shouldUseBootstrap() ) {
		if ( window.currentUser ) {
			return window.currentUser;
		}
		throw new Error( BOOTSTRAP_ERROR_MESSAGE );
	}

	return fetchUser();
}

function getAuthErrorReason( error: unknown ): string {
	if ( error instanceof Error && error.message === BOOTSTRAP_ERROR_MESSAGE ) {
		return 'bootstrap';
	}
	if (
		isWpError( error ) &&
		( error.error === 'authorization_required' || error.statusCode === 401 )
	) {
		return 'unauthorized';
	}
	return 'error';
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
	const { supports } = useAppContext();
	const queryClient = useQueryClient();
	const {
		data: user,
		isLoading: userIsLoading,
		isError: userIsError,
		error: userError,
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

	const handleAuthError = useCallback(
		( reason: string ) => {
			// Prevents repeated calls to redirect
			if ( authErrorHandled.current ) {
				return;
			}

			authErrorHandled.current = true;

			bumpStat( 'dashboard-auth', `bounce:${ reason }` );
			trackAuthBounceLoop();

			if ( config.isEnabled( 'oauth' ) ) {
				const state = crypto.randomUUID();
				sessionStorage.setItem( 'wpcom_oauth_state', state );

				// Default to the signup screen rather than the login screen for certain routes.
				const isNewUser =
					supports.startStoreRoute === true && window.location.pathname === '/start-store';

				window.location.replace(
					getOAuthAuthorizeUrl( {
						state,
						isNewUser,
						next: window.location.pathname + window.location.search,
					} )
				);
				return;
			}

			const currentPath = window.location.href;
			const path = config( 'wpcom_login_url' ) || wpcomLink( '/log-in' );
			const loginUrl = `${ path }?redirect_to=${ encodeURIComponent( currentPath ) }`;
			window.location.href = loginUrl;
		},
		[ supports.startStoreRoute ]
	);

	// Subscribe to network errors and when errors occur due to being logged
	// out, redirect the user to the log in screen.
	useEffect( () => {
		const isAuthError = ( { statusCode, error = '' }: WPError ) => {
			return statusCode === 401 && [ 'authorization_required', 'rest_forbidden' ].includes( error );
		};

		const handleEvent = ( event: MutationCacheNotifyEvent | QueryCacheNotifyEvent ) => {
			// Errors fetching the user object itself are handled (and classified) below.
			if ( 'query' in event && event.query.queryHash === hashKey( AUTH_QUERY_KEY ) ) {
				return;
			}

			if (
				event.type === 'updated' &&
				event.action.type === 'error' &&
				isWpError( event.action.error ) &&
				isAuthError( event.action.error )
			) {
				handleAuthError( 'expired' );
			}
		};
		const unsubMutationCache = queryClient.getMutationCache().subscribe( handleEvent );
		const unsubQueryCache = queryClient.getQueryCache().subscribe( handleEvent );
		return () => {
			unsubMutationCache();
			unsubQueryCache();
		};
	}, [ queryClient, handleAuthError ] );

	const successStatBumped = useRef( false );
	useEffect( () => {
		if ( user?.ID ) {
			setUser( { id: user.ID.toString() } );

			if ( ! successStatBumped.current ) {
				successStatBumped.current = true;
				bumpStat( 'dashboard-auth', shouldUseBootstrap() ? 'success:bootstrap' : 'success:fetch' );
			}
		}
	}, [ user ] );

	// Handles _all_ errors fetching the user object, regardless of whether they are
	// `authorization_required` errors or not.
	if ( userIsError ) {
		if ( typeof window !== 'undefined' ) {
			handleAuthError( getAuthErrorReason( userError ) );
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
