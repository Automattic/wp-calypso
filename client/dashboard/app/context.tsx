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
import type { QueryKey } from '@tanstack/react-query';

export type AgencySupports = {
	overview: boolean;
	tiers: boolean;
	exclusiveOffers: boolean;
	learn: boolean;
	mcp: boolean;
	sites: boolean;
	team: boolean;
	earn: boolean;
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

export type SiteLogsSectionsSupports = {
	activity: boolean;
	php: boolean;
	server: boolean;
};

// Lifecycle routes (overview, critical-error, trial-ended,
// site-building-in-progress, migration pages) are not listed here: they always
// register so the shared site guards have a landing page in every variant.
export type SiteSectionsSupports = {
	domains: boolean;
	plans: boolean;
	backups: boolean;
	scan: boolean;
	performance: boolean;
	monitoring: boolean;
	deployments: boolean;
	logs: SiteLogsSectionsSupports | false;
	settings: boolean;
};

export type SitesSupports = {
	sections: SiteSectionsSupports;
	lockSelfHostedJetpackToOverview: boolean;
};

export type SiteRouteOverride = {
	component: () => Promise< { default: React.FC } >;
	loader?: ( siteSlug: string ) => Promise< void >;
};

export type GateableSiteFeature = 'backups' | 'scan';

export type AppConfig = {
	name: string;
	basePath: string;
	mainRoute: string;
	Logo: React.FC | null;
	LoadingLogo?: React.FC;
	supports: {
		agency: AgencySupports | false;
		agencyClient: AgencyClientSupports | false;
		sites: SitesSupports | false;
		plugins: boolean;
		domains: boolean;
		emails: boolean;
		themes: boolean;
		reader: boolean;
		help: boolean;
		notifications: boolean;
		resurrectedWelcomeModal: boolean;
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
		sites?: () => Promise< { default: React.FC } >;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		siteSwitcher?: () => Promise< { default: React.FC< any > } >;
		siteSidebar?: () => Promise< { default: React.FC } >;
		siteOverview?: SiteRouteOverride;
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
		// Variant-defined site membership. When provided it replaces the
		// canManageSite() capability check on site routes; resolving false
		// results in a 404.
		siteAccessQuery?: ( siteSlug: string ) => {
			queryKey: QueryKey;
			queryFn: () => Promise< boolean >;
		};
		// Variant-defined feature access. When provided it replaces the
		// plan-based gating on the shared backups/scan pages: false renders a
		// "not enabled" state, true renders the feature without an upsell.
		siteFeatureAccessQuery?: (
			siteSlug: string,
			feature: GateableSiteFeature
		) => {
			queryKey: QueryKey;
			queryFn: () => Promise< boolean >;
		};
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
		resurrectedWelcomeModal: false,
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
