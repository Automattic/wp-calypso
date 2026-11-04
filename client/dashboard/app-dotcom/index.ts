import { isEnabled } from '@automattic/calypso-config';
import boot from '../app/boot';
import './style.scss';

boot( {
	name: 'WordPress.com',
	unifiedAdminPageViewApp: 'msd',
	basePath: '/',
	mainRoute: '/sites',
	Logo: null,
	supports: {
		agency: false,
		agencyClient: false,
		sites: true,
		domains: true,
		emails: true,
		reader: true,
		help: true,
		notifications: true,
		resurrectedWelcomeModal: true,
		me: {
			billing: {
				monetizeSubscriptions: true,
			},
			security: {
				sshKey: true,
			},
			apps: true,
		},
		plugins: true,
		commandPalette: true,
		domainOnlySites: true,
		colorScheme: isEnabled( 'dark-mode' ),
		darkMode: isEnabled( 'dark-mode' ),
	},
	components: {
		sites: () => import( '../sites' ),
		siteSwitcher: () => import( '../sites/site-switcher' ),
	},
} );
