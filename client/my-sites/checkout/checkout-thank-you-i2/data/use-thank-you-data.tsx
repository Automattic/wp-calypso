import { translate } from 'i18n-calypso';

export function useThankYouData() {
	return {
		title: translate( 'Get the best out of your site' ),
		subtitle: translate(
			'All set! Start exploring the features included with your [plan name] plan'
		),
	};
}
