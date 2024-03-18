import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP } from 'calypso/lib/titan/constants';
import { recordEmailAppLaunchEvent } from 'calypso/my-sites/email/email-management/home/utils';
import { getTitanControlPanelRedirectPath } from 'calypso/my-sites/email/paths';
import type { ThankYouFooterDetailProps } from 'calypso/components/thank-you-v2/footer';

export default function getTitanFooterDetails(
	selectedSiteSlug: string | null,
	domainName: string,
	currentRoute: string,
	context: string,
	limit?: number
): ThankYouFooterDetailProps[] {
	const titanControlPanelUrl = getTitanControlPanelRedirectPath(
		selectedSiteSlug,
		domainName,
		currentRoute,
		{
			context: TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP,
		}
	);

	const footerDetails = [
		{
			key: 'footer-get-the-app',
			title: translate( 'Manage your email and site from anywhere' ),
			description: translate(
				'The Jetpack mobile app for iOS and Android makes managing your email, domain, and website even simpler.'
			),
			buttonText: translate( 'Get the app' ),
			buttonHref: titanControlPanelUrl,
			buttonOnClick: () => {
				recordEmailAppLaunchEvent( {
					provider: 'titan',
					app: 'app',
					context: 'checkout-thank-you',
				} );
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context,
					type: 'get-the-app',
				} );
			},
		},
		{
			key: 'footer-questions-email',
			title: translate( 'Email questions? We have the answers' ),
			description: translate(
				'Explore our comprehensive support guides and find solutions to all your email inquiries.'
			),
			buttonText: translate( 'Email support resources' ),
			buttonHref: localizeUrl( 'https://wordpress.com/support/category/domains-and-email/email/' ),
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context,
					type: 'questions-email',
				} );
			},
		},
	];

	return footerDetails.slice( 0, limit ?? footerDetails.length );
}
