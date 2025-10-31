import { sitesQuery } from '@automattic/api-queries'; // eslint-disable-line no-restricted-imports
import boot from '../app/boot';
import Logo from './logo';
import './translations';
import type { FetchSitesOptions } from '@automattic/api-core';
import './style.scss';

boot( {
	name: 'CIAB',
	basePath: '/ciab',
	mainRoute: '/sites',
	Logo,
	supports: {
		overview: false,
		sites: {
			deployments: false,
			performance: false,
			monitoring: false,
			logs: false,
			backups: false,
			scan: false,
			domains: true,
			emails: false,
			settings: {
				general: {
					redirect: false,
				},
				server: false,
				security: false,
			},
		},
		domains: true,
		emails: true,
		themes: false,
		reader: false,
		help: true,
		notifications: false,
		me: {
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
	},
} );
