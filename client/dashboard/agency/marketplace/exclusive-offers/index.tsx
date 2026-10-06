import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import {
	MARKETPLACE_PRODUCTS_ROUTE,
	getMarketplaceHostingSectionRoute,
	getMarketplaceReferHostingRoute,
} from '../paths';
import { useMarketplaceType } from '../use-marketplace-type';
import PartnerOffers from './partner-offers';
import type { PartnerOffer, PartnerOfferLinks } from './types';

const LINKS: PartnerOfferLinks = {
	hostingWpcom: getMarketplaceHostingSectionRoute( 'wpcom' ),
	hostingPressable: getMarketplaceHostingSectionRoute( 'pressable' ),
	referPressablePremium: getMarketplaceReferHostingRoute( 'premium' ),
	referEnterprise: getMarketplaceReferHostingRoute( 'enterprise' ),
	products: MARKETPLACE_PRODUCTS_ROUTE,
	woopayments: '/woopayments',
};

export default function ExclusiveOffers() {
	const { recordTracksEvent } = useAnalytics();
	const { updateMarketplaceType } = useMarketplaceType();

	const handleCtaClick = ( offer: PartnerOffer ) => {
		const purchaseType = offer.cta.purchase_type;
		if ( purchaseType === 'referral' || purchaseType === 'regular' ) {
			updateMarketplaceType( purchaseType );
		}
	};

	return (
		<PageLayout header={ <PageHeader title={ __( 'Exclusive offers' ) } /> }>
			<PartnerOffers
				links={ LINKS }
				recordTracksEvent={ recordTracksEvent }
				onCtaClick={ handleCtaClick }
			/>
		</PageLayout>
	);
}
