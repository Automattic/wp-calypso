/* eslint-disable no-restricted-imports */
import {
	sitesQuery,
	paginatedSitesQuery,
	dashboardSiteFiltersQuery,
} from '@automattic/api-queries';
/* eslint-enable no-restricted-imports */
import boot from '../app/boot';
import './translations';
import type {
	FetchSitesOptions,
	FetchPaginatedSitesOptions,
	FetchDashboardSiteFiltersParams,
} from '@automattic/api-core';
import './style.scss';

boot( {
	name: 'CIAB',
	basePath: '/ciab',
	mainRoute: '/sites',
	Logo: null,
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
			privacy: false,
			apps: false,
		},
		plugins: false,
		commandPalette: false,
	},
	optIn: false,
	components: {
		addDomainButton: () => import( '../domains-ciab/add-domain-button' ),
		emptyDomainsState: () => import( '../domains-ciab/empty-domains-state' ),
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
	},
} );
