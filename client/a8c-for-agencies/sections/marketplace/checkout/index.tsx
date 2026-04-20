import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useContext, useEffect } from 'react';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useSelector } from 'calypso/state';
import { hasApprovedAgencyStatus } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { MarketplaceTypeContext } from '../context';
import withMarketplaceProviders from '../hoc/with-marketplace-providers';
import { MARKETPLACE_TYPE_REFERRAL } from '../hoc/with-marketplace-type';
import CheckoutV1 from './checkout-v1';
import CheckoutV2 from './checkout-v2';

interface CheckoutProps {
	referralBlogId?: number;
	isClient?: boolean;
	siteSlug?: string;
	planSlug?: string;
}

function Checkout( { referralBlogId, isClient, siteSlug, planSlug }: CheckoutProps ) {
	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const isReferralMarketplace = marketplaceType === MARKETPLACE_TYPE_REFERRAL;

	const isAgencyApproved = useSelector( hasApprovedAgencyStatus );

	useEffect( () => {
		if ( ! isAgencyApproved && ! isClient ) {
			page.redirect( A4A_MARKETPLACE_LINK );
		}
	}, [ isAgencyApproved, isClient ] );

	if ( ! isAgencyApproved && ! isClient ) {
		return null;
	}

	// New Billing Dragon Checkout V2 page: check for BD feature flag and it's not in a referral context
	if (
		isEnabled( 'a4a-bd-checkout' ) &&
		! isReferralMarketplace &&
		! isClient &&
		! referralBlogId
	) {
		return <CheckoutV2 siteSlug={ siteSlug } planSlug={ planSlug } />;
	}

	return <CheckoutV1 referralBlogId={ referralBlogId } isClient={ isClient } />;
}

export default withMarketplaceProviders( Checkout );
