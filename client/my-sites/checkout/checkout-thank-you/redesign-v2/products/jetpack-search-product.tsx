import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
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

	return (
		<ThankYouProduct
			name="Jetpack Search"
			actions={
				<Button primary href={ productButtonHref }>
					{ productButtonLabel }
				</Button>
			}
		/>
	);
}
