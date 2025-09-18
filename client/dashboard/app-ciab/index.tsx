import boot from '../app/boot';
import Logo from './logo';
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
			domains: false,
			emails: false,
		},
		domains: true,
		emails: true,
		reader: false,
		help: true,
		notifications: false,
		me: {
			privacy: false,
			apps: false,
		},
		plugins: false,
	},
} );
