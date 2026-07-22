/* eslint-disable no-restricted-imports */
import {
	sitesQuery,
	paginatedSitesQuery,
	dashboardSiteFiltersQuery,
	domainsQuery,
} from '@automattic/api-queries';
/* eslint-enable no-restricted-imports */
import boot from '../app/boot';
import { Logo } from './logo';
import {
	agencySiteAccessQuery,
	agencySiteFeatureAccessQuery,
	agencySiteOverviewLoader,
} from './site-routes';
import type {
	FetchSitesOptions,
	FetchPaginatedSitesOptions,
	FetchDashboardSiteFiltersParams,
} from '@automattic/api-core';
import './style.scss';

boot( {
	name: 'A4A',
	basePath: '/',
	mainRoute: '/overview',
	Logo,
	supports: {
		agency: {
			overview: true,
			tiers: true,
			exclusiveOffers: true,
			learn: true,
			mcp: true,
			sites: true,
			team: true,
			earn: true,
		},
		agencyClient: { subscriptions: true },
		sites: {
			sections: {
				domains: false,
				plans: false,
				backups: true,
				scan: true,
				performance: true,
				monitoring: true,
				deployments: true,
				logs: { activity: true, php: true, server: true },
				settings: true,
			},
			lockSelfHostedJetpackToOverview: false,
		},
		domains: false,
		emails: false,
		themes: false,
		reader: false,
		help: true,
		notifications: false,
		resurrectedWelcomeModal: false,
		me: false,
		plugins: false,
		commandPalette: false,
		domainOnlySites: false,
		siteOverview: {
			preview: false,
		},
		colorScheme: false,
		darkMode: false,
	},
	optIn: false,
	components: {
		sites: () => import( '../agency/sites' ),
		siteSidebar: () => import( '../agency/sites/site-sidebar' ),
		siteOverview: {
			component: () => import( '../agency/sites/site/overview' ),
			loader: agencySiteOverviewLoader,
		},
	},
	queries: {
		sitesQuery: ( fetchSiteOptions?: FetchSitesOptions ) => sitesQuery( 'all', fetchSiteOptions ),
		paginatedSitesQuery: ( fetchSiteOptions?: FetchPaginatedSitesOptions ) =>
			paginatedSitesQuery( 'all', fetchSiteOptions ),
		dashboardSiteFiltersQuery: ( fields: FetchDashboardSiteFiltersParams[ 'fields' ] ) =>
			dashboardSiteFiltersQuery( 'all', fields ),
		domainsQuery: () => domainsQuery(),
		siteAccessQuery: agencySiteAccessQuery,
		siteFeatureAccessQuery: agencySiteFeatureAccessQuery,
	},
} );
