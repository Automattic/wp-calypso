/* eslint-disable no-restricted-imports */
import {
	jetpackSitesQuery,
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
			partnerDirectory: true,
			exclusiveOffers: true,
			learn: true,
			mcp: true,
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
	components: {},
	queries: {
		// A4A only deals with Jetpack-connected sites, mirroring the classic app.
		sitesQuery: ( fetchSiteOptions?: FetchSitesOptions ) => jetpackSitesQuery( fetchSiteOptions ),
		paginatedSitesQuery: ( fetchSiteOptions?: FetchPaginatedSitesOptions ) =>
			paginatedSitesQuery( 'all', fetchSiteOptions ),
		dashboardSiteFiltersQuery: ( fields: FetchDashboardSiteFiltersParams[ 'fields' ] ) =>
			dashboardSiteFiltersQuery( 'all', fields ),
		domainsQuery: () => domainsQuery(),
	},
} );
