import boot from '../app/boot';
import Logo from './logo';
import './style.scss';

boot( {
	basePath: '/v2-a4a',
	Logo,
	supports: {
		sites: true,
		domains: false,
		emails: false,
		reader: false,
		help: true,
		notifications: false,
	},
} );
