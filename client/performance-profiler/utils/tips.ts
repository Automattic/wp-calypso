import { translate } from 'i18n-calypso';
import { TipProps } from '../components/tip';

export const tips: Record< string, TipProps > = {
	'uses-responsive-images': {
		title: translate( 'Did you know?' ),
		content: translate(
			'WordPress.com automatically optimizes images and delivers them using a Global CDN to ensure they load lightning fast.'
		),
		linkText: translate( 'Migrate your site' ),
		link: 'https://wordpress.com/setup/hosted-site-migration?ref=performance-profiler-dashboard',
	},
};
