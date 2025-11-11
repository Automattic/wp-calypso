import { sitesQuery, dashboardSiteListQuery } from '@automattic/api-queries'; // eslint-disable-line no-restricted-imports
import boot from '../app/boot';
import { Logo, LoadingLogo } from './logo';
import type { FetchSitesOptions } from '@automattic/api-core';
import './style.scss';

boot( {
	name: 'Automattic for Agencies',
	basePath: '/v2-a4a',
	mainRoute: '/overview',
	LoadingLogo,
	Logo,
	supports: {
		overview: true,
		sites: {
			deployments: false,
			performance: true,
			monitoring: true,
			logs: true,
			backups: true,
			scan: true,
			domains: false,
			emails: false,
			settings: {
				general: {
					redirect: false,
				},
				server: false,
				security: false,
			},
		},
		domains: false,
		emails: false,
		themes: false,
		reader: false,
		help: true,
		notifications: false,
		me: {
			privacy: false,
			apps: false,
		},
		plugins: true,
		commandPalette: false,
	},
	optIn: false,
	components: {
		sites: () => import( '../sites' ),
		siteSwitcher: () => import( '../sites/site-switcher' ),
	},
	queries: {
		sitesQuery: ( fetchSiteOptions?: FetchSitesOptions ) => sitesQuery( 'all', fetchSiteOptions ),
		dashboardSiteListQuery,
	},
} );
