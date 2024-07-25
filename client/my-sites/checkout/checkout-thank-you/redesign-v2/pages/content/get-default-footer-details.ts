import { translate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { ThankYouFooterDetailProps } from 'calypso/components/thank-you-v2/footer';

export default function getDefaultFooterDetails( context: string ): ThankYouFooterDetailProps[] {
	const footerDetails = [
		{
			key: 'footer-generic-support',
			title: translate( 'Everything you need to know' ),
			description: translate( 'Visit Help Center and find an answer to every question.' ),
			buttonText: translate( 'Explore support resources' ),
			showHelpCenterOnClick: true,
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: context,
					type: 'generic-support',
				} );
			},
		},
	];

	return footerDetails;
}
