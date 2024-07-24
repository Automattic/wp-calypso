import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { ThankYouFooterDetailProps } from 'calypso/components/thank-you-v2/footer';

const DOMAIN_SUPPORT_PAGE_ID = 1988;
const EMAIL_SUPPORT_PAGE_ID = 34087;

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
			buttonText: translate( 'Learn the basics of domains' ),
			supportDoc: {
				url: localizeUrl( 'https://wordpress.com/support/domains/' ),
				id: DOMAIN_SUPPORT_PAGE_ID,
			},
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: context,
					type: 'domain-essentials',
				} );
			},
		},
		{
			key: 'footer-email-resources',
			title: translate( 'Your go-to email resource' ),
			description: translate(
				'Dive into our comprehensive support documentation to learn the basics of email, from setup to management.'
			),
			buttonText: translate( 'Email support resources' ),
			supportDoc: {
				url: localizeUrl( 'https://wordpress.com/support/add-email/' ),
				id: EMAIL_SUPPORT_PAGE_ID,
			},
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: context,
					type: 'email-resources',
				} );
			},
		},
	];

	return details.slice( 0, limit ?? details.length );
}
