import boot from '../app/boot';
import { Logo, LoadingLogo } from './logo';
import './style.scss';

boot( {
	name: 'Automattic for Agencies',
	basePath: '/v2-a4a',
	mainRoute: '/overview',
	LoadingLogo,
	Logo,
	supports: {
		overview: true,
		sites: {
			deployments: false,
			performance: true,
			monitoring: true,
			logs: true,
			backups: true,
			scan: true,
			domains: false,
			emails: false,
		},
		sitesCIAB: false,
		domains: false,
		emails: false,
		themes: false,
		reader: false,
		help: true,
		notifications: false,
		me: {
			privacy: false,
			apps: false,
		},
		plugins: true,
		commandPalette: false,
	},
	onboardingLinkSourceQueryArg: 'sites-dashboard',
	onboardingLinks: {
		default: {
			href: '/start',
		},
		withAI: {
			href: '/setup/ai-site-builder',
		},
	},
	optIn: false,
} );
