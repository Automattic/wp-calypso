import boot from '../app/boot';
import Logo from './logo';
import './style.scss';

boot( {
	basePath: '/v2',
	mainRoute: '/sites',
	Logo,
	supports: {
		overview: false,
		sites: true,
		domains: true,
		emails: true,
		reader: true,
		help: true,
		notifications: true,
		me: true,
	},
} );
