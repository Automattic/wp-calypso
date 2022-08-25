import { useTranslate } from 'i18n-calypso';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

import './discount-or-offer-terms.scss';

type DiscountOrOfferTermsProps = {
	isDiscounted: boolean;
	isEligibleForIntroductoryOffer: boolean;
	product: ProductListItem | null;
	isEligibleForIntroductoryOfferFreeTrial: boolean;
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

	const introductoryOffer = product?.introductory_offer;
	const intervalUnit = String( introductoryOffer?.interval_unit );
	const intervalCount = Number( introductoryOffer?.interval_count );
	const numberOfDiscountedRenewals = Number( introductoryOffer?.transition_after_renewal_count );
	const numberOfDiscountedIntervals = intervalCount + numberOfDiscountedRenewals;

	return (
		<>
			{ isEligibleForIntroductoryOfferFreeTrial && (
				<div className="discount-or-offer-terms__free-trial-badge discount-or-offer-terms__item badge badge--info-green">
					{ intervalUnit === 'month'
						? translate( '%(numberOfMonths)d month free', '%(numberOfMonths)d months free', {
								args: {
									numberOfMonths: numberOfDiscountedIntervals,
								},
								count: numberOfDiscountedIntervals,
						  } )
						: translate( '%(numberOfYears)d year free', '%(numberOfYears)d years free', {
								args: {
									numberOfYears: numberOfDiscountedIntervals,
								},
								count: numberOfDiscountedIntervals,
						  } ) }
				</div>
			) }

			{ isEligibleForIntroductoryOffer && ! isEligibleForIntroductoryOfferFreeTrial && (
				<div className="discount-or-offer-terms__introductory-offer-badge discount-or-offer-terms__item badge badge--info-green">
					{ intervalUnit === 'month'
						? translate(
								'%(numberOfMonths)d month discount',
								'%(numberOfMonths)d months discount',
								{
									args: {
										numberOfMonths: numberOfDiscountedIntervals,
									},
									count: numberOfDiscountedIntervals,
								}
						  )
						: translate( '%(numberOfYears)d year discount', '%(numberOfYears)d years discount', {
								args: {
									numberOfYears: numberOfDiscountedIntervals,
								},
								count: numberOfDiscountedIntervals,
						  } ) }
				</div>
			) }

			{ isDiscounted && (
				<div className="discount-or-offer-terms__discount-badge discount-or-offer-terms__item discount-or-offer-terms__discounted_item badge badge--info-green">
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
		</>
	);
};

export { DiscountOrOfferTerms };
