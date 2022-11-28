import {
	getPlan,
	getProductFromSlug,
	isDIFMProduct,
	isDomainTransfer,
	isEmailMonthly,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import {
	isIncludedWithPlan,
	isOneTimePurchase,
	getDIFMTieredPurchaseDetails,
} from 'calypso/lib/purchases';

function PurchaseMetaPrice( { purchase } ) {
	const translate = useTranslate();
	const { productSlug, productDisplayPrice } = purchase;
	const plan = getPlan( productSlug ) || getProductFromSlug( productSlug );

	if ( isOneTimePurchase( purchase ) || isDomainTransfer( purchase ) ) {
		if ( isDIFMProduct( purchase ) ) {
			const difmTieredPurchaseDetails = getDIFMTieredPurchaseDetails( purchase );
			if ( difmTieredPurchaseDetails && difmTieredPurchaseDetails.extraPageCount > 0 ) {
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
										costOfExtraPages,
									},
								}
							) }
						</div>
					</div>
				);
			}
		}

		// translators: displayPrice is the price of the purchase with localized currency (i.e. "C$10")
		return translate( '{{displayPrice/}} {{period}}(one-time){{/period}}', {
			components: {
				displayPrice: (
					<span
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={ { __html: productDisplayPrice } }
					/>
				),
				period: <span className="manage-purchase__time-period" />,
			},
		} );
	}

	if ( isIncludedWithPlan( purchase ) ) {
		return translate( 'Free with Plan' );
	}

	const getPeriod = () => {
		if ( isEmailMonthly( purchase ) ) {
			return translate( 'month' );
		}

		if ( plan && plan.term ) {
			switch ( plan.term ) {
				case TERM_BIENNIALLY:
					return translate( 'two years' );
				case TERM_MONTHLY:
					return translate( 'month' );
			}
		}

		if ( purchase.billPeriodLabel ) {
			switch ( purchase.billPeriodLabel ) {
				case 'per year':
					return translate( 'year' );
				case 'per month':
					return translate( 'month' );
				case 'per week':
					return translate( 'week' );
				case 'per day':
					return translate( 'day' );
			}
		}

		throw new Error( `Failed to get a billing term for ${ productSlug }` );
	};

	const getPriceLabel = ( period ) => {
		//translators: displayPrice is the price of the purchase with localized currency (i.e. "C$10"), %(period)s is how long the plan is active (i.e. "year")
		return translate( '{{displayPrice/}} {{period}}/ %(period)s{{/period}}', {
			args: { period },
			components: {
				displayPrice: (
					<span
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={ { __html: productDisplayPrice } }
					/>
				),
				period: <span className="manage-purchase__time-period" />,
			},
		} );
	};

	return getPriceLabel( getPeriod() );
}

export default PurchaseMetaPrice;
