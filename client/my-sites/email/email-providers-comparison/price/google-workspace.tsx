/* eslint-disable wpcalypso/jsx-classname-namespace */

import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { hasGSuiteSupportedDomain } from 'calypso/lib/gsuite';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import { PriceAndBadgeWithOfferAndDiscountTerms } from 'calypso/my-sites/email/email-providers-comparison/price/price-and-badge-with-offer-and-discount-terms';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import type { ResponseDomain } from 'calypso/lib/domains/types';

import './style.scss';

type GoogleWorkspacePriceProps = {
	isDomainInCart: boolean;
	domain?: ResponseDomain;
	intervalLength: IntervalLength;
};

const getGoogleWorkspaceProductSlug = ( intervalLength: IntervalLength ): string => {
	return intervalLength === IntervalLength.MONTHLY
		? GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY
		: GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY;
};

const GoogleWorkspacePrice = ( {
	domain,
	intervalLength,
	isDomainInCart,
}: GoogleWorkspacePriceProps ) => {
	const productSlug = getGoogleWorkspaceProductSlug( intervalLength );
	const product = useSelector( ( state ) => getProductBySlug( state, productSlug ) );

	const canPurchaseGSuite = useSelector( canUserPurchaseGSuite );
	const translate = useTranslate();

	if ( ! domain && ! isDomainInCart ) {
		return null;
	}

	const isGSuiteSupported =
		canPurchaseGSuite && ( isDomainInCart || hasGSuiteSupportedDomain( [ domain ] ) );

	if ( ! isGSuiteSupported ) {
		return (
			<div className="google-workspace-price__unavailable">
				{ translate( 'Not available for this domain name' ) }
			</div>
		);
	}

	return (
		<PriceAndBadgeWithOfferAndDiscountTerms
			domain={ domain }
			intervalLength={ intervalLength }
			isDomainInCart={ isDomainInCart }
			product={ product }
		/>
	);
};

export default GoogleWorkspacePrice;
