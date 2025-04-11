import boot from '../app/boot';
import './style.scss';

boot( 'dotcom', {
	basePath: '/v2',
	supports: {
		sites: true,
		domains: true,
		emails: true,
		reader: true,
		help: true,
		notifications: true,
	},
} );
