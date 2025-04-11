import { createContext, useContext } from 'react';

export type AppConfig = {
	basePath: string;
	Logo: React.FC | null;
	supports: {
		sites: boolean;
		domains: boolean;
		emails: boolean;
		reader: boolean;
		help: boolean;
		notifications: boolean;
		me: boolean;
	};
};

const AppContext = createContext< AppConfig >( {
	basePath: '',
	Logo: null,
	supports: {
		sites: false,
		domains: false,
		emails: false,
		reader: false,
		help: false,
		notifications: false,
		me: false,
	},
} );

interface AppProviderProps {
	children: React.ReactNode;
	config: AppConfig;
}

export function AppProvider( { children, config }: AppProviderProps ) {
	return <AppContext.Provider value={ { ...config } }>{ children }</AppContext.Provider>;
}

export function useAppContext() {
	return useContext( AppContext );
}
