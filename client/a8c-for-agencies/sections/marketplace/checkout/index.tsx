import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect } from 'react';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useSelector } from 'calypso/state';
import { hasApprovedAgencyStatus } from 'calypso/state/a8c-for-agencies/agency/selectors';
import ClientCheckoutError from '../billing-dragon-checkout/checkout-error';
import { MarketplaceTypeContext } from '../context';
import withMarketplaceProviders from '../hoc/with-marketplace-providers';
import { MARKETPLACE_TYPE_REFERRAL } from '../hoc/with-marketplace-type';
import CheckoutV1 from './checkout-v1';
import CheckoutV2 from './checkout-v2';
import type { PreparedCheckoutRequestResult } from '../lib/prepared-checkout/get-prepared-checkout-request';

interface CheckoutProps {
	referralBlogId?: number;
	isClient?: boolean;
	siteSlug?: string;
	planSlug?: string;
	preparedRequest?: PreparedCheckoutRequestResult;
}

function Checkout( {
	referralBlogId,
	isClient,
	siteSlug,
	planSlug,
	preparedRequest,
}: CheckoutProps ) {
	const translate = useTranslate();
	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const isReferralMarketplace = marketplaceType === MARKETPLACE_TYPE_REFERRAL;

	const isAgencyApproved = useSelector( hasApprovedAgencyStatus );

	// Any prepared-checkout state (including an incomplete or unknown link) is
	// handled by the Billing Dragon checkout so the user sees an explanation
	// instead of being bounced to the Marketplace with the params lost.
	const isPreparedMode = !! preparedRequest && preparedRequest.status !== 'none';

	useEffect( () => {
		if ( ! isAgencyApproved && ! isClient && ! isPreparedMode ) {
			page.redirect( A4A_MARKETPLACE_LINK );
		}
	}, [ isAgencyApproved, isClient, isPreparedMode ] );

	if ( ! isAgencyApproved && ! isClient ) {
		if ( isPreparedMode ) {
			return (
				<ClientCheckoutError
					title={ translate( 'Your agency is not approved for purchases yet.' ) }
					message={ translate(
						'Once your agency is approved, return to where you started this purchase and try again.'
					) }
				/>
			);
		}
		return null;
	}

	// Prepared mode requires the Billing Dragon checkout regardless of the flag,
	// because only it can display a server-prepared Store cart.
	if (
		isPreparedMode ||
		( isEnabled( 'a4a-bd-checkout' ) && ! isReferralMarketplace && ! isClient && ! referralBlogId )
	) {
		return (
			<CheckoutV2 siteSlug={ siteSlug } planSlug={ planSlug } preparedRequest={ preparedRequest } />
		);
	}

	return <CheckoutV1 referralBlogId={ referralBlogId } isClient={ isClient } />;
}

export default withMarketplaceProviders( Checkout );
