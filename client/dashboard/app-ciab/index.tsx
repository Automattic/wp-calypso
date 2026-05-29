/* eslint-disable no-restricted-imports */
import {
	sitesQuery,
	paginatedSitesQuery,
	dashboardSiteFiltersQuery,
	domainsQuery,
} from '@automattic/api-queries';
/* eslint-enable no-restricted-imports */
import boot from '../app/boot';
import { getPostHogConfig } from './posthog';
import CiabDashboardStepperLogo from './stepper-logo';
import './translations';
import type {
	FetchSitesOptions,
	FetchPaginatedSitesOptions,
	FetchDashboardSiteFiltersParams,
} from '@automattic/api-core';
import './style.scss';

boot( {
	name: 'CIAB',
	posthog: getPostHogConfig(),
	basePath: '/',
	mainRoute: '/sites',
	Logo: null,
	LoadingLogo: CiabDashboardStepperLogo,
	supports: {
		sites: true,
		domains: true,
		emails: true,
		themes: false,
		reader: false,
		help: true,
		notifications: false,
		me: {
			billing: {
				monetizeSubscriptions: false,
			},
			security: {
				sshKey: false,
			},
			apps: false,
		},
		plugins: false,
		commandPalette: false,
		domainOnlySites: false,
		startStoreRoute: true,
		siteOverview: {
			preview: true,
		},
		colorScheme: false,
		darkMode: false,
	},
	optIn: false,
	components: {
		sites: () => import( '../sites-ciab' ),
		siteSwitcher: () => import( '../sites-ciab/site-switcher' ),
	},
	queries: {
		sitesQuery: ( fetchSitesOptions?: FetchSitesOptions ) =>
			sitesQuery( [ 'commerce-garden' ], fetchSitesOptions ),
		paginatedSitesQuery: ( fetchSitesOptions?: FetchPaginatedSitesOptions ) =>
			paginatedSitesQuery( [ 'commerce-garden' ], fetchSitesOptions ),
		dashboardSiteFiltersQuery: ( fields: FetchDashboardSiteFiltersParams[ 'fields' ] ) =>
			dashboardSiteFiltersQuery( [ 'commerce-garden' ], fields ),
		domainsQuery: () => domainsQuery( { garden: 'commerce' } ),
	},
} );
