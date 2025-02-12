import {
	isDIFMProduct,
	isDomainTransfer,
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_CENTENNIAL_PERIOD,
	PLAN_MONTHLY_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import {
	isIncludedWithPlan,
	isOneTimePurchase,
	getDIFMTieredPurchaseDetails,
} from 'calypso/lib/purchases';
import type { Purchase } from 'calypso/lib/purchases/types';

function PurchaseMetaPrice( { purchase }: { purchase: Purchase } ) {
	const translate = useTranslate();
	const { priceInteger, currencyCode } = purchase;

	if ( isOneTimePurchase( purchase ) || isDomainTransfer( purchase ) ) {
		if ( isDIFMProduct( purchase ) ) {
			const difmTieredPurchaseDetails = getDIFMTieredPurchaseDetails( purchase );
			if (
				difmTieredPurchaseDetails?.extraPageCount &&
				difmTieredPurchaseDetails.extraPageCount > 0
			) {
				const {
					extraPageCount,
					formattedCostOfExtraPages: costOfExtraPages,
					formattedOneTimeFee: oneTimeFee,
				} = difmTieredPurchaseDetails;
				return (
					<div>
						<div>
							{ translate( 'Service: %(oneTimeFee)s (one-time)', {
								args: {
									oneTimeFee,
								},
							} ) }
						</div>
						<div>
							{ translate(
								'%(extraPageCount)d extra page: %(costOfExtraPages)s (one-time)',
								'%(extraPageCount)d extra pages: %(costOfExtraPages)s (one-time)',
								{
									count: extraPageCount,
									args: {
										extraPageCount,
										costOfExtraPages: costOfExtraPages as string,
									},
								}
							) }
						</div>
					</div>
				);
			}
		}

		// translators: displayPrice is the price of the purchase with localized currency (i.e. "C$10")
		return (
			<>
				{ translate( '{{displayPrice/}} {{period}}(one-time){{/period}}', {
					components: {
						displayPrice: (
							<span>
								{ formatCurrency( priceInteger, currencyCode, {
									stripZeros: true,
									isSmallestUnit: true,
								} ) }
							</span>
						),
						period: <span className="manage-purchase__time-period" />,
					},
				} ) }
			</>
		);
	}

	if ( isIncludedWithPlan( purchase ) ) {
		return <>{ translate( 'Free with Plan' ) }</>;
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
			case PLAN_CENTENNIAL_PERIOD:
				return translate( '100 years' );
			case 7:
				// Note: does this period ever happen? I don't think it does but it
				// was added in https://github.com/Automattic/wp-calypso/pull/65006
				// and so I'm leaving it for now.
				return translate( 'week' );
			case 1:
				// Note: does this period ever happen? I don't think it does but it
				// was added in https://github.com/Automattic/wp-calypso/pull/65006
				// and so I'm leaving it for now.
				return translate( 'day' );
		}

		return null;
	};

	const getPriceLabel = ( period: string | null ) => {
		if (
			// If this is not a product that will renew, we should display the price
			// without "x/year".
			! period ||
			// For introductory offers with prorated renewals, it's confusing to see
			// the renewal price as "x/year", so we will just show the renewal
			// price by itself.
			purchase.introductoryOffer?.isNextRenewalProrated
		) {
			return (
				<span>
					{ formatCurrency( priceInteger, currencyCode, {
						stripZeros: true,
						isSmallestUnit: true,
					} ) }
				</span>
			);
		}

		//translators: displayPrice is the price of the purchase with localized currency (i.e. "C$10"), %(period)s is how long the plan is active (i.e. "year")
		return (
			<>
				{ translate( '{{displayPrice/}} {{period}}/ %(period)s{{/period}}', {
					args: { period },
					components: {
						displayPrice: (
							<span>
								{ formatCurrency( priceInteger, currencyCode, {
									stripZeros: true,
									isSmallestUnit: true,
								} ) }
							</span>
						),
						period: <span className="manage-purchase__time-period" />,
					},
				} ) }
			</>
		);
	};

	return getPriceLabel( getPeriod() );
}

export default PurchaseMetaPrice;
