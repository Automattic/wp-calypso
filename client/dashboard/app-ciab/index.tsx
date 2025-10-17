import boot from '../app/boot';
import Logo from './logo';
import './translations';
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
			domains: true,
			emails: false,
		},
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
	optIn: false,
	components: {
		sites: () => import( '../sites-ciab' ),
	},
} );
