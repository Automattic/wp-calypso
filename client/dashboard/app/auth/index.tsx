import { fetchUser, isWpError } from '@automattic/api-core';
import { clearQueryClient, disablePersistQueryClient } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { isSupportUserSession } from '@automattic/calypso-support-session';
import { magnificentNonEnLocales } from '@automattic/i18n-utils';
import {
	useQuery,
	useQueryClient,
	type QueryCacheNotifyEvent,
	type MutationCacheNotifyEvent,
} from '@tanstack/react-query';
import { createContext, useContext, useMemo, useEffect, useRef, useCallback } from 'react';
import type { User } from '@automattic/api-core';

export const AUTH_QUERY_KEY = [ 'auth', 'user' ];

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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if ( ( window as any ).currentUser ) {
			// TODO: align the various `currentUser` types. The different types have
			// different opinions on which fields are required and optional.
			// - packages/api-core/src/me/types.ts
			// - packages/data-stores/src/user/types.ts
			// - client/lib/user/user.d.ts

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return ( window as any ).currentUser;
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

		let logoutUrl = '';

		// If logout_URL isn't set, then go ahead and return the logout URL
		// without a proper nonce as a fallback.
		// Note: we never want to use logout_URL in the desktop app
		if ( ! user.logout_URL || config.isEnabled( 'always_use_logout_url' ) ) {
			// Use localized version of the homepage in the redirect
			let subdomain = '';
			if ( magnificentNonEnLocales.includes( user.language ) ) {
				subdomain = user.language + '.';
			}

			logoutUrl = ( config( 'logout_url' ) as string ).replace( '|subdomain|', subdomain );
		} else {
			logoutUrl = user.logout_URL;
		}

		return {
			user,
			logout: async () => {
				disablePersistQueryClient();
				clearQueryClient();

				// Dynamically import Calypso v1 cleanup code because it includes a number
				// of dependencies we don't want included in the Hosting Dashboard bundle.
				const { disablePersistence, clearStore } = await import( 'calypso/lib/user/store' );
				disablePersistence();
				clearStore();

				window.location.href = logoutUrl;
			},
		};
	}, [ user ] );

	const handleAuthError = useCallback( () => {
		// Prevents repeated calls to redirect
		if ( authErrorHandled.current ) {
			return;
		}

		authErrorHandled.current = true;
		const currentPath = window.location.pathname;
		const loginUrl = `/log-in?redirect_to=${ encodeURIComponent( currentPath ) }`;
		window.location.href = loginUrl;
	}, [] );

	// Subscribe to network errors and when errors occur due to being logged
	// out, redirect the user to the log in screen.
	useEffect( () => {
		const handleEvent = ( event: MutationCacheNotifyEvent | QueryCacheNotifyEvent ) => {
			if (
				event.type === 'updated' &&
				event.action.type === 'error' &&
				isWpError( event.action.error ) &&
				[ 401, 403 ].includes( event.action.error.statusCode ) &&
				event.action.error.error === 'authorization_required' &&
				! authErrorHandled.current // Prevents repeated calls to redirect
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
