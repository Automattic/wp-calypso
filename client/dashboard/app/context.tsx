import { createContext, useContext } from 'react';

export type SiteFeatureSupports = {
	deployments: boolean;
	performance: boolean;
	monitoring: boolean;
	logs: boolean;
	backups: boolean;
	scan: boolean;
	domains: boolean;
	emails: boolean;
};

export type MeSupports = {
	privacy: boolean;
	apps: boolean;
};

export type OnboardingLink = {
	href: string;
};

export type AppConfig = {
	name: string;
	basePath: string;
	mainRoute: string;
	Logo: React.FC | null;
	LoadingLogo?: React.FC;
	supports: {
		overview: boolean;
		sites: SiteFeatureSupports | false;
		plugins: boolean;
		domains: boolean;
		emails: boolean;
		themes: boolean;
		reader: boolean;
		help: boolean;
		notifications: boolean;
		me: MeSupports | false;
		commandPalette: boolean;
	};
	onboardingLinkSourceQueryArg: string;
	onboardingLinks?: {
		default: OnboardingLink;
		withAI: OnboardingLink;
	};
};

const AppContext = createContext< AppConfig >( {
	name: '',
	basePath: '',
	mainRoute: '',
	Logo: null,
	LoadingLogo: undefined,
	supports: {
		overview: false,
		sites: false,
		plugins: false,
		domains: false,
		emails: false,
		themes: false,
		reader: false,
		help: false,
		notifications: false,
		me: false,
		commandPalette: false,
	},
	onboardingLinkSourceQueryArg: '',
	onboardingLinks: undefined,
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
