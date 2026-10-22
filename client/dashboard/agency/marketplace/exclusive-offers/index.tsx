import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { ApprovalGate, useIsApprovalGated } from '../../approval-gate';
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
	const isGated = useIsApprovalGated();
	const [ isGateOpen, setIsGateOpen ] = useState( false );

	const handleCtaClick = ( offer: PartnerOffer, event: React.MouseEvent ) => {
		const purchaseType = offer.cta.purchase_type;
		// Partner programs outside Automattic link out and stay open.
		if ( isGated && offer.offerType === 'refer' && ! offer.cta.external ) {
			event.preventDefault();
			setIsGateOpen( true );
			return;
		}
		if ( purchaseType === 'referral' || purchaseType === 'regular' ) {
			updateMarketplaceType( purchaseType );
		}
	};

	return (
		<PageLayout header={ <PageHeader title={ __( 'Exclusive offers' ) } /> }>
			{ isGateOpen && <ApprovalGate kind="referral" onClose={ () => setIsGateOpen( false ) } /> }
			<PartnerOffers
				links={ LINKS }
				recordTracksEvent={ recordTracksEvent }
				onCtaClick={ handleCtaClick }
			/>
		</PageLayout>
	);
}
