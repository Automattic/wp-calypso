/* eslint-disable no-restricted-imports */
import {
	sitesQuery,
	paginatedSitesQuery,
	dashboardSiteFiltersQuery,
	domainsQuery,
} from '@automattic/api-queries';
/* eslint-enable no-restricted-imports */
import config from '@automattic/calypso-config';
import boot from '../app/boot';
import { getCiabDashboardBasePath } from './routing';
import './translations';
import type {
	FetchSitesOptions,
	FetchPaginatedSitesOptions,
	FetchDashboardSiteFiltersParams,
} from '@automattic/api-core';
import './style.scss';

boot( {
	name: 'CIAB',
	posthog: config.isEnabled( 'posthog-tracking' ) ? config( 'ciab_posthog_api_key' ) : undefined,
	basePath: getCiabDashboardBasePath( window.location.hostname ),
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
		domainOnlySites: false,
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
