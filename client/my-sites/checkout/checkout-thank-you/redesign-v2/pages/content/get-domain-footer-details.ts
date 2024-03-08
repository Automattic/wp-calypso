import { translate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { ThankYouFooterDetailProps } from 'calypso/components/thank-you-v2/footer';

export default function getDomainFooterDetails(
	context: string,
	limit?: number
): ThankYouFooterDetailProps[] {
	const details = [
		{
			key: 'footer-domain-essentials',
			title: translate( 'Dive into domain essentials' ),
			description: translate(
				'Check out our support documentation for step-by-step instructions and expert guidance on your domain set up.'
			),
			buttonText: translate( 'Learn the domain basics' ),
			buttonHref: '/support/domains',
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: context,
					type: 'domain-essentials',
				} );
			},
		},
		{
			key: 'footer-domain-resources',
			title: translate( 'Your go-to domain resource' ),
			description: translate(
				'Dive into our comprehensive support documentation to learn the basics of domains, from registration to management.'
			),
			buttonText: translate( 'Domain support resources' ),
			buttonHref: '/support/category/domains-and-email/',
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: context,
					type: 'domain-resources',
				} );
			},
		},
	];

	return details.slice( 0, limit ?? details.length );
}
