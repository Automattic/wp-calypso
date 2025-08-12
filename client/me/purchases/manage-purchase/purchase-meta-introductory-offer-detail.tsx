import {
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_MONTHLY_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { isWithinIntroductoryOfferPeriod } from 'calypso/lib/purchases';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { ReactNode } from 'react';

function PurchaseMetaIntroductoryOfferDetail( {
	purchase,
}: {
	purchase: Purchase;
} ): JSX.Element | null {
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

		if ( ! timePeriod && purchase.introductoryOffer.isNextRenewalUsingOffer ) {
			return (
				<RenewalSubtext
					text={ translate(
						'After the offer ends, the subscription price will be %(regularPrice)s',
						{
							args: {
								regularPrice: formatCurrency( purchase.regularPriceInteger, purchase.currencyCode, {
									isSmallestUnit: true,
									stripZeros: true,
								} ),
							},
						}
					) }
				/>
			);
		}

		if (
			! timePeriod &&
			! purchase.introductoryOffer.isNextRenewalUsingOffer &&
			purchase.introductoryOffer.isNextRenewalProrated
		) {
			return (
				<RenewalSubtext
					text={ translate(
						'After the first renewal, the subscription price will be %(regularPrice)s',
						{
							args: {
								regularPrice: formatCurrency( purchase.regularPriceInteger, purchase.currencyCode, {
									isSmallestUnit: true,
									stripZeros: true,
								} ),
							},
						}
					) }
				/>
			);
		}

		if ( timePeriod && purchase.introductoryOffer.isNextRenewalUsingOffer ) {
			return (
				<RenewalSubtext
					text={ translate(
						'After the offer ends, the subscription price will be %(regularPrice)s / %(timePeriod)s',
						{
							args: {
								regularPrice: formatCurrency( purchase.regularPriceInteger, purchase.currencyCode, {
									isSmallestUnit: true,
									stripZeros: true,
								} ),
								timePeriod,
							},
						}
					) }
				/>
			);
		}

		if (
			timePeriod &&
			! purchase.introductoryOffer.isNextRenewalUsingOffer &&
			purchase.introductoryOffer.isNextRenewalProrated
		) {
			return (
				<RenewalSubtext
					text={ translate(
						'After the first renewal, the subscription price will be %(regularPrice)s / %(timePeriod)s',
						{
							args: {
								regularPrice: formatCurrency( purchase.regularPriceInteger, purchase.currencyCode, {
									isSmallestUnit: true,
									stripZeros: true,
								} ),
								timePeriod,
							},
						}
					) }
				/>
			);
		}
	}

	return null;
}

function RenewalSubtext( { text }: { text: ReactNode } ): JSX.Element {
	return (
		<>
			<br /> <br /> <small className="manage-purchase__renewal-text"> { text } </small>{ ' ' }
		</>
	);
}

export default PurchaseMetaIntroductoryOfferDetail;
