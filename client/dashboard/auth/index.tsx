import { createContext, useContext } from 'react';
import { login } from 'calypso/lib/paths/login';
import { useAuthQuery } from './use-auth-query';
import type { User } from '../data/types';

interface AuthContextType {
	user: User;
}
const AuthContext = createContext< AuthContextType | undefined >( undefined );

/**
 * This component:
 * 1. Fetches and provides auth data via context
 * 2. Handles authentication checking
 * 3. Shows nothing during loading (fallbacks to the HTML loading screen)
 * 4. Redirects to login if unauthorized
 */
export function AuthProvider( { children }: { children: React.ReactNode } ) {
	const { data: user, isLoading, isError } = useAuthQuery();

	if ( isError ) {
		if ( typeof window !== 'undefined' ) {
			const currentPath = window.location.pathname;
			const loginUrl = login( { redirectTo: currentPath } );
			window.location.href = loginUrl;
		}
		return null;
	}

	if ( isLoading || ! user ) {
		return null;
	}

	return <AuthContext.Provider value={ { user } }>{ children }</AuthContext.Provider>;
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
