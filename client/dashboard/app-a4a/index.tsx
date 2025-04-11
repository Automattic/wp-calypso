import boot from '../app/boot';
import Logo from './logo';
import './style.scss';

boot( {
	basePath: '/v2-a4a',
	mainRoute: '/overview',
	Logo,
	supports: {
		overview: true,
		sites: true,
		domains: false,
		emails: false,
		reader: false,
		help: true,
		notifications: false,
		me: true,
	},
} );
