import { createContext, useContext } from 'react';

export type AppType = 'dotcom' | 'a4a';

interface AppContextProps {
	appType: AppType;
}

const AppContext = createContext< AppContextProps >( { appType: 'dotcom' } );

interface AppProviderProps {
	children: React.ReactNode;
	appType: AppType;
}

export function AppProvider( { children, appType }: AppProviderProps ) {
	return <AppContext.Provider value={ { appType } }>{ children }</AppContext.Provider>;
}

export function useAppContext() {
	return useContext( AppContext );
}
