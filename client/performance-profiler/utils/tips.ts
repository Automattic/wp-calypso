import { translate } from 'i18n-calypso';
import { TipProps } from '../components/tip';

export const tips: Record< string, TipProps > = {
	'uses-responsive-images': {
		title: translate( 'Did you know?' ),
		content: translate(
			'WordPress.com automatically optimizes images and delivers them using a Global CDN to ensure they load lightning fast.'
		),
		linkText: translate( 'Migrate your site' ),
		link: 'https://wordpress.com/setup/site-migration?ref=performance-profiler-dashboard',
	},
};

const createLoggedInTip = (): TipProps => ( {
	title: translate( 'Did you know?' ),
	content: translate(
		'Jetpack Boost automatically optimizes images and delivers them using a Global CDN to ensure they load lightning fast.'
	),
	linkText: translate( 'Get Jetpack Boost' ),
	link: 'https://wordpress.com/plugins/jetpack-boost',
} );

export const loggedInTips: Record< string, TipProps > = {
	'uses-responsive-images': createLoggedInTip(),
	'uses-long-cache-ttl': createLoggedInTip(),
	'server-response-time': createLoggedInTip(),
	'render-blocking-resources': createLoggedInTip(),
	'unminified-css': createLoggedInTip(),
};
