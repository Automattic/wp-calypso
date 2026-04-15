import { createContext, useContext } from 'react';
import type { CurrentUser } from '@automattic/data-stores';

interface WpcomUserContextValue {
	user: CurrentUser | null;
	isLoggedIn: boolean;
}

const WpcomUserContext = createContext< WpcomUserContextValue >( {
	user: null,
	isLoggedIn: false,
} );

export function WpcomUserProvider( {
	user,
	children,
}: {
	user: CurrentUser | null;
	children: React.ReactNode;
} ) {
	const value = {
		user,
		isLoggedIn: !! user?.ID,
	};

	return <WpcomUserContext.Provider value={ value }>{ children }</WpcomUserContext.Provider>;
}

export function useWpcomUser(): WpcomUserContextValue {
	return useContext( WpcomUserContext );
}
