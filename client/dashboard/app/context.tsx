import { createContext, useContext } from 'react';

export type AppType = 'dotcom' | 'a4a';

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
	};
};

interface AppContextProps {
	appType: AppType;
	config: AppConfig;
}

const AppContext = createContext< AppContextProps >( {
	appType: 'dotcom',
	config: {
		basePath: '',
		Logo: null,
		supports: {
			sites: false,
			domains: false,
			emails: false,
			reader: false,
			help: false,
			notifications: false,
		},
	},
} );

interface AppProviderProps {
	children: React.ReactNode;
	appType: AppType;
	config: AppConfig;
}

export function AppProvider( { children, appType, config }: AppProviderProps ) {
	return <AppContext.Provider value={ { appType, config } }>{ children }</AppContext.Provider>;
}

export function useAppContext() {
	return useContext( AppContext );
}
