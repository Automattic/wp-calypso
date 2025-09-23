import { isEnabled } from '@automattic/calypso-config';
import { useContext } from 'react';
import ClientCheckoutPlaceholder from '../billing-dragon-checkout/checkout-placeholder';
import { MarketplaceTypeContext } from '../context';
import withMarketplaceType, { MARKETPLACE_TYPE_REFERRAL } from '../hoc/with-marketplace-type';
import JetpackStartCheckout from './jetpack-start-checkout';

interface CheckoutProps {
	referralBlogId?: number;
	isClient?: boolean;
}

function Checkout( { referralBlogId, isClient }: CheckoutProps ) {
	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const isReferralMarketplace = marketplaceType === MARKETPLACE_TYPE_REFERRAL;

	// Always use JetpackStartCheckout for current regular Checkout flow and referrals
	if ( isReferralMarketplace || ! isEnabled( 'a4a-bd-checkout' ) ) {
		return <JetpackStartCheckout referralBlogId={ referralBlogId } isClient={ isClient } />;
	}

	// For regular checkout, check feature flag
	if ( isEnabled( 'a4a-bd-checkout' ) ) {
		return (
			<>
				<div style={ { color: 'white' } }> This is the Billing Dragon Checkout page</div>
				<ClientCheckoutPlaceholder />;
			</>
		);
	}

	return <ClientCheckoutPlaceholder />;
}

export default withMarketplaceType( Checkout );
