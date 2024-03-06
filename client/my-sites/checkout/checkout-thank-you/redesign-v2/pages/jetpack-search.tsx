import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import {
	getJetpackSearchCustomizeUrl,
	getJetpackSearchDashboardUrl,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSite } from 'calypso/state/ui/selectors';

export default function JetpackSearchThankYou() {
	const siteId = useSelector( getSelectedSiteId );
	const jetpackSearchCustomizeUrl = useSelector( ( state ) =>
		getJetpackSearchCustomizeUrl( state, siteId )
	);
	const jetpackSearchDashboardUrl = useSelector( ( state ) =>
		getJetpackSearchDashboardUrl( state, siteId )
	);
	const selectedSite = useSelector( getSelectedSite );

	const productButtonLabel = selectedSite.jetpack
		? translate( 'Go to Search Dashboard' )
		: translate( 'Customize Search' );
	const productButtonHref = selectedSite.jetpack
		? jetpackSearchDashboardUrl
		: jetpackSearchCustomizeUrl;
	const product = (
		<ThankYouProduct
			name="Jetpack Search"
			actions={
				<Button primary href={ productButtonHref }>
					{ productButtonLabel }
				</Button>
			}
		/>
	);

	const footerDetails = [
		{
			key: 'footer-generic-support',
			title: translate( 'Everything you need to know' ),
			description: translate( 'Explore our support guides and find an answer to every question.' ),
			buttonText: translate( 'Explore support resources' ),
			buttonHref: '/support',
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: context,
					type: 'generic-support',
				} );
			},
		},
	];

	return (
		<ThankYouV2
			title={ translate( 'Welcome to Jetpack Search!' ) }
			subtitle={
				<>
					<>{ translate( 'We are currently indexing your site.' ) }</>
					<>
						{ translate(
							'In the meantime, we have configured Jetpack Search on your site — you should try customizing it in your traditional WordPress dashboard.'
						) }
					</>
				</>
			}
			products={ product }
			footerDetails={ footerDetails }
		/>
	);
}
