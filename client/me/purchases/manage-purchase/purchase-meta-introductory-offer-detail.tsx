import {
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_MONTHLY_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { isWithinIntroductoryOfferPeriod } from 'calypso/lib/purchases';
import { Purchase } from 'calypso/lib/purchases/types';

function PurchaseMetaIntroductoryOfferDetail( { purchase }: { purchase: Purchase } ) {
	const translate = useTranslate();

	if ( ! isWithinIntroductoryOfferPeriod( purchase ) ) {
		return null;
	}

	const getPeriod = () => {
		switch ( purchase.billPeriodDays ) {
			case PLAN_TRIENNIAL_PERIOD:
				return translate( 'three years' );
			case PLAN_BIENNIAL_PERIOD:
				return translate( 'two years' );
			case PLAN_ANNUAL_PERIOD:
				return translate( 'year' );
			case PLAN_MONTHLY_PERIOD:
				return translate( 'month' );
		}
		return null;
	};

	if ( purchase?.introductoryOffer && purchase.introductoryOffer !== null ) {
		const timePeriod = getPeriod();
		let regularPriceText = null;

		if ( ! timePeriod && purchase.introductoryOffer.isNextRenewalUsingOffer ) {
			regularPriceText = translate(
				'After the offer ends, the subscription price will be %(regularPrice)s',
				{
					args: {
						regularPrice: formatCurrency( purchase.regularPriceInteger, purchase.currencyCode, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
					},
				}
			);
		}

		if (
			! timePeriod &&
			! purchase.introductoryOffer.isNextRenewalUsingOffer &&
			purchase.introductoryOffer.isNextRenewalProrated
		) {
			regularPriceText = translate(
				'After the first renewal, the subscription price will be %(regularPrice)s',
				{
					args: {
						regularPrice: formatCurrency( purchase.regularPriceInteger, purchase.currencyCode, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
					},
				}
			);
		}

		if ( timePeriod && purchase.introductoryOffer.isNextRenewalUsingOffer ) {
			regularPriceText = translate(
				'After the offer ends, the subscription price will be %(regularPrice)s / %(timePeriod)',
				{
					args: {
						regularPrice: formatCurrency( purchase.regularPriceInteger, purchase.currencyCode, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
						timePeriod,
					},
				}
			);
		}

		if (
			timePeriod &&
			! purchase.introductoryOffer.isNextRenewalUsingOffer &&
			purchase.introductoryOffer.isNextRenewalProrated
		) {
			regularPriceText = translate(
				'After the first renewal, the subscription price will be %(regularPrice)s / %(timePeriod)',
				{
					args: {
						regularPrice: formatCurrency( purchase.regularPriceInteger, purchase.currencyCode, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
						timePeriod,
					},
				}
			);
		}

		return (
			<>
				<br />
				{ regularPriceText && (
					<>
						{ ' ' }
						<br /> <small> { regularPriceText } </small>{ ' ' }
					</>
				) }
			</>
		);
	}
}

export default PurchaseMetaIntroductoryOfferDetail;
