import boot from '../app/boot';
import './style.scss';

boot( 'a4a', {
	basePath: '/v2-a4a',
	supports: {
		sites: true,
		domains: false,
		emails: false,
		reader: false,
		help: true,
		notifications: false,
	},
} );
