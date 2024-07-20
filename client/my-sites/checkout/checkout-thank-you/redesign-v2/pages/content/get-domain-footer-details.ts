import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { ThankYouFooterDetailProps } from 'calypso/components/thank-you-v2/footer';

const SUPPORT_SITE_ID = 9619154;
const DOMAIN_SUPPORT_PAGE_ID = 1988;
const EMAIL_SUPPORT_PAGE_ID = 34087;

export default function getDomainFooterDetails(
	context: string,
	setShowSupportDoc: ( url: string, postId: number, blogId: number ) => void,
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
			buttonOnClick: () => {
				setShowSupportDoc(
					localizeUrl( 'https://wordpress.com/support/domains/' ),
					DOMAIN_SUPPORT_PAGE_ID,
					SUPPORT_SITE_ID
				);
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
			buttonOnClick: () => {
				setShowSupportDoc(
					localizeUrl( 'https://wordpress.com/support/add-email/' ),
					EMAIL_SUPPORT_PAGE_ID,
					SUPPORT_SITE_ID
				);
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: context,
					type: 'email-resources',
				} );
			},
		},
	];

	return details.slice( 0, limit ?? details.length );
}
