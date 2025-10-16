import { fetchUser } from '@automattic/api-core';
import { clearQueryClient, disablePersistQueryClient } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { magnificentNonEnLocales } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useMemo } from 'react';
import type { User } from '@automattic/api-core';

export const AUTH_QUERY_KEY = [ 'auth', 'user' ];

interface AuthContextType {
	user: User;
	logout: () => Promise< void >;
}
export const AuthContext = createContext< AuthContextType | undefined >( undefined );

/**
 * This component:
 * 1. Fetches and provides auth data via context
 * 2. Handles authentication checking
 * 3. Shows nothing during loading (falls back to the HTML loading screen)
 * 4. Redirects to login if unauthorized
 */
export function AuthProvider( { children }: { children: React.ReactNode } ) {
	const {
		data: user,
		isLoading: userIsLoading,
		isError: userIsError,
	} = useQuery( {
		queryKey: AUTH_QUERY_KEY,
		queryFn: fetchUser,
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

	if ( userIsError ) {
		if ( typeof window !== 'undefined' ) {
			const currentPath = window.location.pathname;
			const loginUrl = `/log-in?redirect_to=${ encodeURIComponent( currentPath ) }`;
			window.location.href = loginUrl;
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
