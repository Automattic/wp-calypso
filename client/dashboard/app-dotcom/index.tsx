import boot from '../app/boot';
import Logo from './logo';
import './style.scss';

boot( {
	basePath: '/v2',
	mainRoute: '/sites',
	Logo,
	supports: {
		overview: false,
		sites: {
			deployments: true,
			performance: true,
			monitoring: true,
			logs: true,
			backups: true,
			domains: true,
			emails: true,
		},
		domains: true,
		emails: true,
		reader: true,
		help: true,
		notifications: true,
		me: {
			privacy: true,
			apps: true,
		},
		plugins: true,
	},
} );
