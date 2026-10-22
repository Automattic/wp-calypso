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
	User,
} from '@automattic/api-core';
import type { PostHogOverrides } from '@automattic/posthog';

export type AgencySupports = {
	overview: boolean;
	tiers: boolean;
	partnerDirectory: boolean;
	marketplace: boolean;
	exclusiveOffers: boolean;
	learn: boolean;
	mcp: boolean;
	amplify: boolean;
	devTools: boolean;
	sites: boolean;
	plugins: boolean;
	team: boolean;
	earn: boolean;
	billing: boolean;
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

export type AppConfig = {
	name: string;
	unifiedAdminPageViewApp?: 'msd' | 'a4a';
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
		reader: boolean;
		help: boolean;
		notifications: boolean;
		resurrectedWelcomeModal: boolean;
		me: MeSupports | false;
		commandPalette: boolean;
		domainOnlySites: boolean;
		colorScheme: boolean;
		darkMode: boolean;
		/** Opens a backup's details at `/sites/$siteSlug/backups/$rewindId` from an Activity Log backup range. */
		backupDetailsLinks: boolean;
	};
	posthog?: {
		apiKey: string;
		overrides?: PostHogOverrides;
	};
	optIn: boolean;
	components: {
		sites?: () => Promise< { default: React.FC } >;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		siteSwitcher?: () => Promise< { default: React.FC< any > } >;
		/** Replaces the WordPress.com omnibar, whose nodes come from the admin bar endpoint. */
		omnibar?: React.FC< { user?: User } >;
		/** Replaces the WordPress.com Help Center panel, which the omnibar's help node toggles. */
		helpCenter?: React.FC;
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
		reader: false,
		help: false,
		notifications: false,
		resurrectedWelcomeModal: false,
		me: false,
		commandPalette: false,
		domainOnlySites: false,
		colorScheme: false,
		darkMode: false,
		backupDetailsLinks: false,
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
