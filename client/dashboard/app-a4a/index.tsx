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
			earn: true,
		},
		agencyClient: { subscriptions: true },
		sites: false,
		domains: false,
		emails: false,
		themes: false,
		reader: false,
		help: true,
		notifications: false,
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
		// Temporary: reuse the generic site switcher until it's agency-scoped.
		siteSwitcher: () => import( '../sites/site-switcher' ),
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
