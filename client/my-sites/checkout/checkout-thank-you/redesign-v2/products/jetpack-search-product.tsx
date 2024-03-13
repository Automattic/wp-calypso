import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import {
	getJetpackSearchCustomizeUrl,
	getJetpackSearchDashboardUrl,
} from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

export type ThankYouJetpackSearchProductProps = {
	purchase: ReceiptPurchase;
	siteId: number | null;
};

export default function ThankYouJetpackSearchProduct( {
	purchase,
	siteId,
}: ThankYouJetpackSearchProductProps ) {
	const selectedSite = useSelector( getSelectedSite );
	const jetpackSearchCustomizeUrl = useSelector( ( state ) =>
		getJetpackSearchCustomizeUrl( state, siteId )
	);
	const jetpackSearchDashboardUrl = useSelector( ( state ) =>
		// At this point in the flow, having purchased a product for a specific
		// site, we can assume that `siteId` is a number and not `null`.
		getJetpackSearchDashboardUrl( state, siteId as number )
	);

	const productButtonLabel = selectedSite?.jetpack
		? translate( 'Go to Search Dashboard' )
		: translate( 'Customize Search' );
	const productButtonHref = selectedSite?.jetpack
		? jetpackSearchDashboardUrl
		: jetpackSearchCustomizeUrl;

	const recordThankYouClick = () => {
		recordTracksEvent( 'calypso_jetpack_product_thankyou', {
			product_name: 'search',
			value: selectedSite?.jetpack ? 'Search Dashboard' : 'Customizer',
			site: selectedSite?.jetpack ? 'jetpack' : 'wpcom',
		} );
	};

	return (
		<ThankYouProduct
			name={ purchase.productName }
			actions={
				<Button primary href={ productButtonHref as string } onClick={ recordThankYouClick }>
					{ productButtonLabel }
				</Button>
			}
		/>
	);
}
