/* eslint-disable wpcalypso/jsx-classname-namespace */

import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import { hasIntroductoryOffer, hasIntroductoryOfferFreeTrial } from 'calypso/lib/emails';
import {
	hasGSuiteSupportedDomain,
	isDomainEligibleForGoogleWorkspaceIntroductoryOffer,
} from 'calypso/lib/gsuite';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import PriceBadge from 'calypso/my-sites/email/email-providers-comparison/price-badge';
import PriceWithInterval from 'calypso/my-sites/email/email-providers-comparison/price-with-interval';
import PriceInformation from 'calypso/my-sites/email/email-providers-comparison/price/price-information';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

import './style.scss';

type BasicDiscountOrOfferTerms = {
	isDiscounted: boolean;
	isEligibleForIntroductoryOffer: boolean;
	product: ProductListItem | null;
};

type DiscountOrOfferTermsProps = BasicDiscountOrOfferTerms & {
	isEligibleForIntroductoryOfferFreeTrial: boolean;
};

type PriceBadgeExtendedProps = BasicDiscountOrOfferTerms & {
	domain?: ResponseDomain;
	intervalLength: IntervalLength;
};

type GoogleWorkspacePriceProps = PriceBadgeExtendedProps & {
	isDomainInCart: boolean;
};

const getGoogleWorkspaceProductSlug = ( intervalLength: IntervalLength ): string => {
	return intervalLength === IntervalLength.MONTHLY
		? GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY
		: GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY;
};

const PriceBadgeExtended = ( {
	domain,
	intervalLength,
	isDiscounted,
	isEligibleForIntroductoryOffer,
	product,
}: PriceBadgeExtendedProps ) => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	return (
		<PriceBadge
			priceInformation={ <PriceInformation domain={ domain } product={ product } /> }
			price={
				<PriceWithInterval
					currencyCode={ currencyCode ?? '' }
					intervalLength={ intervalLength }
					isDiscounted={ isDiscounted }
					isEligibleForIntroductoryOffer={ isEligibleForIntroductoryOffer }
					product={ product }
				/>
			}
		/>
	);
};

const DiscountOrOfferTerms = ( {
	isDiscounted,
	isEligibleForIntroductoryOffer,
	isEligibleForIntroductoryOfferFreeTrial,
	product,
}: DiscountOrOfferTermsProps ) => {
	const translate = useTranslate();

	// This only makes sense if there's some sale discount or introductory offer
	if ( ! isDiscounted && ! isEligibleForIntroductoryOffer ) {
		return null;
	}

	if ( isDiscounted ) {
		return (
			<div className="google-workspace-price__discount-badge badge badge--info-green">
				{ translate( 'Limited time: %(discount)d%% off', {
					args: {
						discount: product?.sale_coupon?.discount,
					},
					comment: "%(discount)d is a numeric discount percentage (e.g. '40')",
				} ) }
			</div>
		);
	}

	const introductoryOffer = product?.introductory_offer;
	const intervalUnit = String( introductoryOffer?.interval_unit );
	const intervalCount = Number( introductoryOffer?.interval_count );

	if ( ! [ 'month', 'year' ].includes( intervalUnit ) || intervalCount < 1 ) {
		return null;
	}

	if ( isEligibleForIntroductoryOfferFreeTrial ) {
		return (
			<div className="google-workspace-price__trial-badge badge badge--info-green">
				{ intervalUnit === 'month'
					? translate( '%(numberOfMonths)d month free', '%(numberOfMonths)d months free', {
							args: {
								numberOfMonths: intervalCount,
							},
							count: intervalCount,
					  } )
					: translate( '%(numberOfYears)d year free', '%(numberOfYears)d years free', {
							args: {
								numberOfYears: intervalCount,
							},
							count: intervalCount,
					  } ) }
			</div>
		);
	}

	return (
		<div className="google-workspace-price__trial-badge badge badge--info-green">
			{ intervalUnit === 'month'
				? translate( '%(numberOfMonths)d month discount', '%(numberOfMonths)d months discount', {
						args: {
							numberOfMonths: intervalCount,
						},
						count: intervalCount,
				  } )
				: translate( '%(numberOfYears)d year discount', '%(numberOfYears)d years discount', {
						args: {
							numberOfYears: intervalCount,
						},
						count: intervalCount,
				  } ) }
		</div>
	);
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

	const isDiscounted = hasDiscount( product );

	const isEligibleForIntroductoryOffer = domain
		? isDomainEligibleForGoogleWorkspaceIntroductoryOffer( domain )
		: isDomainInCart && hasIntroductoryOffer( product );
	const isEligibleForIntroductoryOfferFreeTrial =
		isEligibleForIntroductoryOffer && hasIntroductoryOfferFreeTrial( product );

	window.console.log( 'ZXX', {
		isEligibleForIntroductoryOfferFreeTrial,
		isEligibleForIntroductoryOffer,
		...( product?.introductory_offer ? { offer: product?.introductory_offer } : {} ),
		productHasFreeTrial: hasIntroductoryOfferFreeTrial( product ),
	} );

	return (
		<>
			<DiscountOrOfferTerms
				isDiscounted={ isDiscounted }
				isEligibleForIntroductoryOffer={ isEligibleForIntroductoryOffer }
				isEligibleForIntroductoryOfferFreeTrial={ isEligibleForIntroductoryOfferFreeTrial }
				product={ product }
			/>

			<PriceBadgeExtended
				intervalLength={ intervalLength }
				isDiscounted={ isDiscounted }
				isEligibleForIntroductoryOffer={ isEligibleForIntroductoryOffer }
				product={ product }
			/>
		</>
	);
};

export default GoogleWorkspacePrice;
