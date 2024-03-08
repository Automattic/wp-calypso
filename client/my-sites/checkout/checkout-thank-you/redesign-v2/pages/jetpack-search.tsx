import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThankYouJetpackSearchProduct from '../products/jetpack-search-product';
import type { ThankYouJetpackSearchProductProps } from '../products/jetpack-search-product';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

export type JetpackSearchThankYouProps = {
	purchase: ReceiptPurchase;
};

export default function JetpackSearchThankYou( {
	purchase,
}: Omit< ThankYouJetpackSearchProductProps, 'siteId' > ) {
	const siteId = useSelector( getSelectedSiteId );
	const footerDetails = [
		{
			key: 'footer-generic-support',
			title: translate( 'Everything you need to know' ),
			description: translate( 'Explore our support guides and find an answer to every question.' ),
			buttonText: translate( 'Explore support resources' ),
			buttonHref: localizeUrl( 'https://wordpress.com/support/' ),
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: 'jetpack-search',
					type: 'generic-support',
				} );
			},
		},
		{
			key: 'footer-plugins-support',
			title: translate( 'All-in-one plugin documentation' ),
			description: translate(
				"Unlock your plugin's potential with our comprehensive support documentation."
			),
			buttonText: translate( 'Plugin documentation' ),
			buttonHref: localizeUrl( 'https://wordpress.com/support/category/plugins-and-integrations/' ),
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: 'plugins-support',
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
			products={ <ThankYouJetpackSearchProduct siteId={ siteId } purchase={ purchase } /> }
			footerDetails={ footerDetails }
		/>
	);
}
