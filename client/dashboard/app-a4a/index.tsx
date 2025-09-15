import boot from '../app/boot';
import { Logo, LoadingLogo } from './logo';
import './style.scss';

boot( {
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
		},
		domains: false,
		emails: false,
		reader: false,
		help: true,
		notifications: false,
		me: {
			privacy: false,
			apps: false,
		},
		plugins: true,
	},
} );
