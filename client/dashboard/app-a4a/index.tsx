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
import A4AOmnibar from './omnibar';
import A4AOmnibarHelpCenter from './omnibar-help-center';
import type {
	FetchSitesOptions,
	FetchPaginatedSitesOptions,
	FetchDashboardSiteFiltersParams,
} from '@automattic/api-core';
import './style.scss';

boot( {
	name: 'A4A',
	unifiedAdminPageViewApp: 'a4a',
	basePath: '/',
	mainRoute: '/overview',
	Logo,
	supports: {
		agency: {
			overview: true,
			tiers: true,
			partnerDirectory: true,
			marketplace: true,
			exclusiveOffers: true,
			learn: true,
			mcp: true,
			amplify: true,
			devTools: true,
			sites: true,
			plugins: true,
			team: true,
			earn: true,
		},
		agencyClient: { subscriptions: true },
		sites: false,
		domains: false,
		emails: false,
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
		omnibar: A4AOmnibar,
		helpCenter: A4AOmnibarHelpCenter,
	},
	queries: {
		sitesQuery: ( fetchSiteOptions?: FetchSitesOptions ) => sitesQuery( 'all', fetchSiteOptions ),
		paginatedSitesQuery: ( fetchSiteOptions?: FetchPaginatedSitesOptions ) =>
			paginatedSitesQuery( 'all', fetchSiteOptions ),
		dashboardSiteFiltersQuery: ( fields: FetchDashboardSiteFiltersParams[ 'fields' ] ) =>
			dashboardSiteFiltersQuery( 'all', fields ),
		domainsQuery: () => domainsQuery(),
	},
} );
