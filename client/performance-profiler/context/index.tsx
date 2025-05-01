import { createContext, type ReactNode } from 'react';

export interface UserContextType {
	isUserLoggedIn: boolean;
}

export const UserContext = createContext< UserContextType >( { isUserLoggedIn: false } );

interface UserProviderProps {
	children: ReactNode;
	isUserLoggedIn: boolean;
}

export function UserProvider( { children, isUserLoggedIn }: UserProviderProps ) {
	return <UserContext.Provider value={ { isUserLoggedIn } }>{ children }</UserContext.Provider>;
}
