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
		sites: false,
		ciabSites: true,
		domains: true,
		emails: true,
		themes: false,
		reader: false,
		help: true,
		notifications: false,
		me: {
			privacy: false,
			apps: false,
		},
		plugins: false,
		commandPalette: false,
	},
	onboardingLinkSourceQueryArg: 'ciab-sites-dashboard',
	onboardingLinks: {
		default: {
			href: '/start',
		},
		withAI: {
			href: '/setup/ai-site-builder-spec',
		},
	},
} );
