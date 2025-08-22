import { createContext, useContext } from 'react';

export type SiteFeatureSupports = {
	deployments: boolean;
	performance: boolean;
	monitoring: boolean;
	logs: boolean;
	backups: boolean;
	domains: boolean;
	emails: boolean;
};

export type MeSupports = {
	privacy: boolean;
};

export type AppConfig = {
	basePath: string;
	mainRoute: string;
	Logo: React.FC | null;
	LoadingLogo?: React.FC;
	supports: {
		overview: boolean;
		sites: SiteFeatureSupports | false;
		domains: boolean;
		emails: boolean;
		reader: boolean;
		help: boolean;
		notifications: boolean;
		me: MeSupports | false;
	};
};

const AppContext = createContext< AppConfig >( {
	basePath: '',
	mainRoute: '',
	Logo: null,
	LoadingLogo: undefined,
	supports: {
		overview: false,
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
