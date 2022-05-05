/* eslint-disable wpcalypso/jsx-classname-namespace */

import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import {
	hasGSuiteSupportedDomain,
	isDomainEligibleForGoogleWorkspaceFreeTrial,
} from 'calypso/lib/gsuite';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import PriceBadge from 'calypso/my-sites/email/email-providers-comparison/price-badge';
import PriceWithInterval from 'calypso/my-sites/email/email-providers-comparison/price-with-interval';
import PriceInformation from 'calypso/my-sites/email/email-providers-comparison/price/price-information';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import type { SiteDomain } from 'calypso/state/sites/domains/types';

import './style.scss';

const getGoogleWorkspaceProductSlug = ( intervalLength: IntervalLength ): string => {
	return intervalLength === IntervalLength.MONTHLY
		? GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY
		: GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY;
};

type GoogleWorkspacePriceProps = {
	domain?: SiteDomain;
	intervalLength: IntervalLength;
	isDomainInCart: boolean;
};

const GoogleWorkspacePrice = ( {
	domain,
	intervalLength,
	isDomainInCart,
}: GoogleWorkspacePriceProps ): JSX.Element | null => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const productSlug = getGoogleWorkspaceProductSlug( intervalLength );
	const product = useSelector( ( state ) => getProductBySlug( state, productSlug ) );

	const canPurchaseGSuite = useSelector( canUserPurchaseGSuite );

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

	const isDiscounted = hasDiscount( product );
	const isEligibleForFreeTrial = isDomainEligibleForGoogleWorkspaceFreeTrial( domain );

	const priceWithInterval = (
		<PriceWithInterval
			currencyCode={ currencyCode ?? '' }
			intervalLength={ intervalLength }
			isDiscounted={ isDiscounted }
			isEligibleForFreeTrial={ isEligibleForFreeTrial }
			product={ product }
		/>
	);

	return (
		<>
			{ isDiscounted && (
				<div className="google-workspace-price__discount-badge badge badge--info-green">
					{ translate( 'Limited time: %(discount)d%% off', {
						args: {
							discount: product?.sale_coupon?.discount,
						},
						comment: "%(discount)d is a numeric discount percentage (e.g. '40')",
					} ) }
				</div>
			) }

			{ isEligibleForFreeTrial && (
				<div className="google-workspace-price__trial-badge badge badge--info-green">
					{ translate( '1 month free' ) }
				</div>
			) }

			<PriceBadge
				priceInformation={ <PriceInformation domain={ domain } product={ product } /> }
				price={ priceWithInterval }
			/>
		</>
	);
};

export default GoogleWorkspacePrice;
