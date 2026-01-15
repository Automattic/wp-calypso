/* eslint-disable no-restricted-imports */
import {
	sitesQuery,
	dashboardSiteListQuery,
	dashboardSiteFiltersQuery,
} from '@automattic/api-queries';
/* eslint-enable no-restricted-imports */
import boot from '../app/boot';
import './translations';
import type {
	FetchSitesOptions,
	FetchDashboardSiteListParams,
	FetchDashboardSiteFiltersParams,
} from '@automattic/api-core';
import './style.scss';

boot( {
	name: 'CIAB',
	basePath: '/ciab',
	mainRoute: '/sites',
	Logo: null,
	supports: {
		sites: {
			settings: {
				general: {
					redirect: false,
				},
				server: false,
				security: false,
				experimental: false,
			},
		},
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
			privacy: false,
			apps: false,
		},
		plugins: false,
		commandPalette: false,
	},
	optIn: false,
	components: {
		sites: () => import( '../sites-ciab' ),
		siteSwitcher: () => import( '../sites-ciab/site-switcher' ),
	},
	queries: {
		sitesQuery: ( fetchSitesOptions?: FetchSitesOptions ) =>
			sitesQuery( [ 'commerce-garden' ], fetchSitesOptions ),
		dashboardSiteListQuery: ( fetchDashboardSiteListParams?: FetchDashboardSiteListParams ) =>
			dashboardSiteListQuery( [ 'commerce-garden' ], fetchDashboardSiteListParams ),
		dashboardSiteFiltersQuery: ( fields: FetchDashboardSiteFiltersParams[ 'fields' ] ) =>
			dashboardSiteFiltersQuery( [ 'commerce-garden' ], fields ),
	},
} );
