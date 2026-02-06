/* eslint-disable no-restricted-imports */
import {
	sitesQuery,
	paginatedSitesQuery,
	dashboardSiteFiltersQuery,
} from '@automattic/api-queries';
/* eslint-enable no-restricted-imports */
import { createContext, useContext } from 'react';
import type {
	FetchSitesOptions,
	FetchPaginatedSitesOptions,
	FetchDashboardSiteFiltersParams,
} from '@automattic/api-core';

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
		sites: boolean;
		plugins: boolean;
		domains: boolean;
		emails: boolean;
		themes: boolean;
		reader: boolean;
		help: boolean;
		notifications: boolean;
		me: MeSupports | false;
		commandPalette: boolean;
		domainOnlySites: boolean;
	};
	optIn: boolean;
	components: Record< string, () => Promise< { default: React.FC } > >;
	queries: {
		sitesQuery: ( fetchSiteOptions?: FetchSitesOptions ) => ReturnType< typeof sitesQuery >;
		paginatedSitesQuery: (
			fetchSiteOptions?: FetchPaginatedSitesOptions
		) => ReturnType< typeof paginatedSitesQuery >;
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
		domainOnlySites: false,
	},
	optIn: false,
	components: {},
	queries: {
		sitesQuery: ( fetchSiteOptions?: FetchSitesOptions ) => sitesQuery( 'all', fetchSiteOptions ),
		paginatedSitesQuery: ( fetchSiteOptions?: FetchPaginatedSitesOptions ) =>
			paginatedSitesQuery( 'all', fetchSiteOptions ),
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
