/* eslint-disable no-restricted-imports */
import {
	sitesQuery,
	dashboardSiteListQuery,
	dashboardSiteFiltersQuery,
} from '@automattic/api-queries';
/* eslint-enable no-restricted-imports */
import boot from '../app/boot';
import Logo from './logo';
import type {
	FetchSitesOptions,
	FetchDashboardSiteListParams,
	FetchDashboardSiteFiltersParams,
} from '@automattic/api-core';
import './style.scss';

boot( {
	name: 'WordPress.com',
	basePath: '/',
	mainRoute: '/sites',
	Logo,
	supports: {
		sites: {
			deployments: true,
			performance: true,
			monitoring: true,
			logs: true,
			backups: true,
			scan: true,
			domains: true,
			emails: true,
			settings: {
				general: {
					redirect: true,
				},
				server: true,
				security: true,
				experimental: true,
			},
		},
		domains: true,
		emails: true,
		themes: true,
		reader: true,
		help: true,
		notifications: true,
		me: {
			privacy: true,
			apps: true,
		},
		plugins: true,
		commandPalette: false,
	},
	optIn: true,
	components: {
		sites: () => import( '../sites' ),
		siteSwitcher: () => import( '../sites/site-switcher' ),
	},
	queries: {
		sitesQuery: ( fetchSiteOptions?: FetchSitesOptions ) => sitesQuery( 'all', fetchSiteOptions ),
		dashboardSiteListQuery: ( fetchDashboardSiteListParams?: FetchDashboardSiteListParams ) =>
			dashboardSiteListQuery( 'all', fetchDashboardSiteListParams ),
		dashboardSiteFiltersQuery: ( fields: FetchDashboardSiteFiltersParams[ 'fields' ] ) =>
			dashboardSiteFiltersQuery( 'all', fields ),
	},
} );
