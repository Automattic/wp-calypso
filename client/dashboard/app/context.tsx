/* eslint-disable no-restricted-imports */
import {
	sitesQuery,
	paginatedSitesQuery,
	dashboardSiteFiltersQuery,
	domainsQuery,
} from '@automattic/api-queries';
/* eslint-enable no-restricted-imports */
import { createContext, useContext } from 'react';
import type {
	FetchSitesOptions,
	FetchPaginatedSitesOptions,
	FetchDashboardSiteFiltersParams,
} from '@automattic/api-core';
import type { PostHogOverrides } from '@automattic/posthog';

export type AgencySupports = {
	overview: boolean;
	tiers: boolean;
	exclusiveOffers: boolean;
	learn: boolean;
	mcp: boolean;
};

export type AgencyClientSupports = {
	subscriptions: boolean;
};

export type MeBillingSupports = {
	monetizeSubscriptions: boolean;
};

export type MeSecuritySupports = {
	sshKey: boolean;
};

export type MeSupports = {
	billing: MeBillingSupports | false;
	security: MeSecuritySupports | false;
	apps: boolean;
};

export type SiteOverviewSupports = {
	preview: boolean;
};

export type AppConfig = {
	name: string;
	basePath: string;
	mainRoute: string;
	Logo: React.FC | null;
	LoadingLogo?: React.FC;
	supports: {
		agency: AgencySupports | false;
		agencyClient: AgencyClientSupports | false;
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
		startStoreRoute?: boolean;
		siteOverview: SiteOverviewSupports;
		colorScheme: boolean;
		darkMode: boolean;
	};
	posthog?: {
		apiKey: string;
		overrides?: PostHogOverrides;
	};
	optIn: boolean;
	components: {
		sites: () => Promise< { default: React.FC } >;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		siteSwitcher: () => Promise< { default: React.FC< any > } >;
	};
	queries: {
		sitesQuery: ( fetchSiteOptions?: FetchSitesOptions ) => ReturnType< typeof sitesQuery >;
		paginatedSitesQuery: (
			fetchSiteOptions?: FetchPaginatedSitesOptions
		) => ReturnType< typeof paginatedSitesQuery >;
		dashboardSiteFiltersQuery: (
			field: FetchDashboardSiteFiltersParams[ 'fields' ]
		) => ReturnType< typeof dashboardSiteFiltersQuery >;
		domainsQuery: () => ReturnType< typeof domainsQuery >;
	};
};

export const APP_CONTEXT_DEFAULT_CONFIG: AppConfig = {
	name: '',
	basePath: '',
	mainRoute: '',
	Logo: null,
	LoadingLogo: undefined,
	supports: {
		agency: false,
		agencyClient: false,
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
		startStoreRoute: false,
		siteOverview: {
			preview: false,
		},
		colorScheme: false,
		darkMode: false,
	},
	optIn: false,
	components: {
		sites: () => Promise.resolve( { default: () => null } ),
		siteSwitcher: () => Promise.resolve( { default: () => null } ),
	},
	queries: {
		sitesQuery: ( fetchSiteOptions?: FetchSitesOptions ) => sitesQuery( 'all', fetchSiteOptions ),
		paginatedSitesQuery: ( fetchSiteOptions?: FetchPaginatedSitesOptions ) =>
			paginatedSitesQuery( 'all', fetchSiteOptions ),
		dashboardSiteFiltersQuery: ( fields: FetchDashboardSiteFiltersParams[ 'fields' ] ) =>
			dashboardSiteFiltersQuery( 'all', fields ),
		domainsQuery: () => domainsQuery(),
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
