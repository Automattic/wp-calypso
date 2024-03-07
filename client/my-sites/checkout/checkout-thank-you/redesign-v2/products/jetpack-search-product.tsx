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

export type ThankYouJetpackSearchProductProps = {
	siteId: number | null;
};

export default function ThankYouJetpackSearchProduct( {
	siteId,
}: ThankYouJetpackSearchProductProps ) {
	const selectedSite = useSelector( getSelectedSite );
	const jetpackSearchCustomizeUrl = useSelector( ( state ) =>
		getJetpackSearchCustomizeUrl( state, siteId )
	);
	const jetpackSearchDashboardUrl = useSelector( ( state ) =>
		getJetpackSearchDashboardUrl( state, siteId )
	);

	const productButtonLabel = selectedSite.jetpack
		? translate( 'Go to Search Dashboard' )
		: translate( 'Customize Search' );
	const productButtonHref = selectedSite.jetpack
		? jetpackSearchDashboardUrl
		: jetpackSearchCustomizeUrl;

	const recordThankYouClick = () => {
		recordTracksEvent( 'calypso_jetpack_product_thankyou', {
			product_name: 'search',
			value: 'Customizer',
			site: 'wpcom',
		} );
	};

	return (
		<ThankYouProduct
			name="Jetpack Search"
			actions={
				<Button primary href={ productButtonHref } onClick={ recordThankYouClick }>
					{ productButtonLabel }
				</Button>
			}
		/>
	);
}
