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
		agency: { overview: true, tiers: true, exclusiveOffers: true },
		agencyClient: { subscriptions: true },
		sites: true,
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
		// Temporary: reuse generic sites components until A4A-specific ones are built.
		sites: () => import( '../sites' ),
		siteSwitcher: () => import( '../sites/site-switcher' ),
	},
	queries: {
		// Temporary: reuse "all sites" filters; these will be tightened to agency sites later.
		sitesQuery: ( fetchSiteOptions?: FetchSitesOptions ) => sitesQuery( 'all', fetchSiteOptions ),
		paginatedSitesQuery: ( fetchSiteOptions?: FetchPaginatedSitesOptions ) =>
			paginatedSitesQuery( 'all', fetchSiteOptions ),
		dashboardSiteFiltersQuery: ( fields: FetchDashboardSiteFiltersParams[ 'fields' ] ) =>
			dashboardSiteFiltersQuery( 'all', fields ),
		domainsQuery: () => domainsQuery(),
	},
} );
