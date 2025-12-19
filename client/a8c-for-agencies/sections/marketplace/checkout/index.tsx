import { isEnabled } from '@automattic/calypso-config';
import { useContext } from 'react';
import { MarketplaceTypeContext } from '../context';
import withMarketplaceProviders from '../hoc/with-marketplace-providers';
import { MARKETPLACE_TYPE_REFERRAL } from '../hoc/with-marketplace-type';
import CheckoutV1 from './checkout-v1';
import CheckoutV2 from './checkout-v2';

interface CheckoutProps {
	referralBlogId?: number;
	isClient?: boolean;
}

function Checkout( { referralBlogId, isClient }: CheckoutProps ) {
	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const isReferralMarketplace = marketplaceType === MARKETPLACE_TYPE_REFERRAL;

	// New Billing Dragon Checkout V2 page: check for BD feature flag and it's not in a referral context
	if (
		isEnabled( 'a4a-bd-checkout' ) &&
		! isReferralMarketplace &&
		! isClient &&
		! referralBlogId
	) {
		return <CheckoutV2 />;
	}

	// Fallback to the original Checkout V1
	return <CheckoutV1 referralBlogId={ referralBlogId } isClient={ isClient } />;
}

export default withMarketplaceProviders( Checkout );
