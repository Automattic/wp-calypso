import { isEnabled } from '@automattic/calypso-config';
import { useContext } from 'react';
import { MarketplaceTypeContext } from '../context';
import withMarketplaceType, { MARKETPLACE_TYPE_REFERRAL } from '../hoc/with-marketplace-type';
import CheckoutV1 from './checkout-v1';
import CheckoutV2 from './checkout-v2';

interface CheckoutProps {
	referralBlogId?: number;
	isClient?: boolean;
}

function Checkout( { referralBlogId, isClient }: CheckoutProps ) {
	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const isReferralMarketplace = marketplaceType === MARKETPLACE_TYPE_REFERRAL;

	// Use Checkout V2 (Jetpack Start) for current regular Checkout flow and referrals
	if ( ! isEnabled( 'a4a-bd-checkout' ) || isReferralMarketplace || isClient ) {
		return <CheckoutV1 referralBlogId={ referralBlogId } isClient={ isClient } />;
	}

	// New Billing Dragon Checkout page, check feature flag
	if ( isEnabled( 'a4a-bd-checkout' ) ) {
		return <CheckoutV2 />;
	}

	// Todo: replace it with a placeholder and error notification.
	// Fallback, should never happen.
	return null;
}

export default withMarketplaceType( Checkout );
