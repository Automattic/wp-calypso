/* eslint-disable wpcalypso/jsx-classname-namespace */

import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import { hasGSuiteSupportedDomain } from 'calypso/lib/gsuite';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import PriceBadge from 'calypso/my-sites/email/email-providers-comparison/price-badge';
import PriceWithInterval from 'calypso/my-sites/email/email-providers-comparison/price-with-interval';
import PriceInformation from 'calypso/my-sites/email/email-providers-comparison/price/price-information';
import useGetDomainIntroductoryOfferEligibilities from 'calypso/my-sites/email/email-providers-comparison/price/use-get-domain-introductory-offer-eligibilities';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import type { ResponseDomain } from 'calypso/lib/domains/types';

import './style.scss';

const getGoogleWorkspaceProductSlug = ( intervalLength: IntervalLength ): string => {
	return intervalLength === IntervalLength.MONTHLY
		? GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY
		: GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY;
};

const getApproximateDiscountForOffer = ( product: ProductListItem | null ) => {
	if ( ! product || ! product?.introductory_offer ) {
		return 0;
	}

	const offer = product.introductory_offer;

	if ( ! offer.cost_per_interval ) {
		return 100;
	}

	return ( ( product.cost - offer.cost_per_interval ) / product.cost ) * 100;
};

type GoogleWorkspacePriceProps = {
	domain?: ResponseDomain;
	intervalLength: IntervalLength;
	isDomainInCart: boolean;
};

const GoogleWorkspacePrice = ( {
	domain,
	intervalLength,
	isDomainInCart,
}: GoogleWorkspacePriceProps ) => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const translate = useTranslate();

	const productSlug = getGoogleWorkspaceProductSlug( intervalLength );
	const product = useSelector( ( state ) => getProductBySlug( state, productSlug ) );

	const canPurchaseGSuite = useSelector( canUserPurchaseGSuite );

	const { isEligibleForIntroductoryOffer, isEligibleForIntroductoryOfferFreeTrial } =
		useGetDomainIntroductoryOfferEligibilities( {
			domain,
			isDomainInCart,
			product,
		} );

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

	const priceWithInterval = (
		<PriceWithInterval
			currencyCode={ currencyCode ?? '' }
			intervalLength={ intervalLength }
			isDiscounted={ isDiscounted }
			isEligibleForIntroductoryOffer={ isEligibleForIntroductoryOffer }
			product={ product }
		/>
	);

	const numberOfTrialMonths = product?.introductory_offer?.interval_count ?? 1;

	return (
		<>
			{ isEligibleForIntroductoryOfferFreeTrial && (
				<div className="google-workspace-price__trial-badge badge badge--info-green">
					{ translate(
						'%(numberOfTrialMonths)d month free',
						'%(numberOfTrialMonths)d months free',
						{
							args: {
								numberOfTrialMonths: numberOfTrialMonths,
							},
							count: numberOfTrialMonths,
							comment:
								"%(numberOfTrialMonths)d is the number of months when the trial is active (e.g. '3')",
						}
					) }
				</div>
			) }

			{ isEligibleForIntroductoryOffer && ! isEligibleForIntroductoryOfferFreeTrial && (
				<div className="google-workspace-price__trial-badge badge badge--info-green">
					{ translate( '%(approximateDiscountForOffer)d%% off', {
						args: {
							approximateDiscountForOffer: getApproximateDiscountForOffer( product ),
						},
						comment: "%(approximateDiscountForOffer)d is a numeric discount percentage (e.g. '40')",
					} ) }
				</div>
			) }

			{ isDiscounted && ! isEligibleForIntroductoryOfferFreeTrial && (
				<div className="google-workspace-price__discount-badge badge badge--info-green">
					{ isEligibleForIntroductoryOffer
						? translate( 'Extra %(discount)d%% off', {
								args: {
									discount: product?.sale_coupon?.discount,
								},
								comment: "%(discount)d is a numeric discount percentage (e.g. '40')",
						  } )
						: translate( 'Limited time: %(discount)d%% off', {
								args: {
									discount: product?.sale_coupon?.discount,
								},
								comment: "%(discount)d is a numeric discount percentage (e.g. '40')",
						  } ) }
				</div>
			) }

			<PriceBadge
				priceInformation={
					<PriceInformation
						domain={ domain }
						isDomainInCart={ isDomainInCart }
						product={ product }
					/>
				}
				price={ priceWithInterval }
			/>
		</>
	);
};

export default GoogleWorkspacePrice;
