/* eslint-disable no-restricted-imports */
import {
	sitesQuery,
	dashboardSiteListQuery,
	dashboardSiteFiltersQuery,
} from '@automattic/api-queries';
/* eslint-enable no-restricted-imports */
import { createContext, useContext } from 'react';
import type {
	FetchSitesOptions,
	FetchDashboardSiteListParams,
	FetchDashboardSiteFiltersParams,
} from '@automattic/api-core';

export type SiteSettingsGeneralSupports = {
	redirect: boolean;
};

export type SiteSettingsSupports = {
	general: SiteSettingsGeneralSupports;
	server: boolean;
	security: boolean;
	experimental: boolean;
};

export type SiteFeatureSupports = {
	deployments: boolean;
	performance: boolean;
	monitoring: boolean;
	logs: boolean;
	backups: boolean;
	scan: boolean;
	domains: boolean;
	emails: boolean;
	settings: SiteSettingsSupports | false;
};

export type MeBillingSupports = {
	monetizeSubscriptions: boolean;
};

export type MeSecuritySupports = {
	sshKey: boolean;
};

export type MeSupports = {
	billing: MeBillingSupports | false;
	privacy: boolean;
	security: MeSecuritySupports | false;
	apps: boolean;
};

export type AppConfig = {
	name: string;
	basePath: string;
	mainRoute: string;
	Logo: React.FC | null;
	LoadingLogo?: React.FC;
	supports: {
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
	optIn: boolean;
	components: Record< string, () => Promise< { default: React.FC } > >;
	queries: {
		sitesQuery: ( fetchSiteOptions?: FetchSitesOptions ) => ReturnType< typeof sitesQuery >;
		dashboardSiteListQuery: (
			params?: FetchDashboardSiteListParams
		) => ReturnType< typeof dashboardSiteListQuery >;
		dashboardSiteFiltersQuery: (
			field: FetchDashboardSiteFiltersParams[ 'fields' ]
		) => ReturnType< typeof dashboardSiteFiltersQuery >;
	};
};

export const APP_CONTEXT_DEFAULT_CONFIG: AppConfig = {
	name: '',
	basePath: '',
	mainRoute: '',
	Logo: null,
	LoadingLogo: undefined,
	supports: {
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
	optIn: false,
	components: {},
	queries: {
		sitesQuery: ( fetchSiteOptions?: FetchSitesOptions ) => sitesQuery( 'all', fetchSiteOptions ),
		dashboardSiteListQuery: ( fetchDashboardSiteListParams?: FetchDashboardSiteListParams ) =>
			dashboardSiteListQuery( 'all', fetchDashboardSiteListParams ),
		dashboardSiteFiltersQuery: ( fields: FetchDashboardSiteFiltersParams[ 'fields' ] ) =>
			dashboardSiteFiltersQuery( 'all', fields ),
	},
};

const AppContext = createContext< AppConfig >( APP_CONTEXT_DEFAULT_CONFIG );

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
