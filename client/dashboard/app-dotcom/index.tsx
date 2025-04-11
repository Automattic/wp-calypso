import boot from '../app/boot';
import Logo from './logo';
import './style.scss';

boot( 'dotcom', {
	basePath: '/v2',
	Logo,
	supports: {
		sites: true,
		domains: true,
		emails: true,
		reader: true,
		help: true,
		notifications: true,
	},
} );
