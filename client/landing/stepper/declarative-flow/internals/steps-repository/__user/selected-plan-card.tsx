import {
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_MONTHLY_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
	getMonthlyPlanByYearly,
	getPlan,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/number-formatters';
import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import { Badge } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import type { TranslateResult } from 'i18n-calypso';

interface SelectedPlanCardProps {
	planSlug: string;
	coupon: string | undefined;
}

function SelectedPlanCard( { planSlug, coupon }: SelectedPlanCardProps ) {
	const translate = useTranslate();
	const { data: plans } = Plans.usePlans( { coupon } );
	const pricing = plans?.[ planSlug ]?.pricing;
	const planName = getPlan( planSlug )?.getTitle();

	if ( ! pricing || ! planName ) {
		return null;
	}

	const monthlyPrice = pricing.discountedPrice.monthly ?? pricing.originalPrice.monthly;
	if ( monthlyPrice === null ) {
		return null;
	}

	const price = formatCurrency( monthlyPrice, pricing.currencyCode, {
		isSmallestUnit: true,
		stripZeros: true,
	} );

	let priceText: TranslateResult | null;
	switch ( pricing.billPeriod ) {
		case PLAN_MONTHLY_PERIOD:
			priceText = translate( '%(price)s/mo, billed monthly', { args: { price } } );
			break;
		case PLAN_ANNUAL_PERIOD:
			priceText = translate( '%(price)s/mo, billed yearly', { args: { price } } );
			break;
		case PLAN_BIENNIAL_PERIOD:
			priceText = translate( '%(price)s/mo, billed every two years', { args: { price } } );
			break;
		case PLAN_TRIENNIAL_PERIOD:
			priceText = translate( '%(price)s/mo, billed every three years', { args: { price } } );
			break;
		default:
			priceText = null;
	}

	let savings = 0;
	if ( pricing.billPeriod !== PLAN_MONTHLY_PERIOD ) {
		const monthlyPlanPricing = plans?.[ getMonthlyPlanByYearly( planSlug ) ]?.pricing;
		const monthlyPlanPrice =
			monthlyPlanPricing?.discountedPrice.monthly ?? monthlyPlanPricing?.originalPrice.monthly;
		if ( monthlyPlanPrice && monthlyPlanPrice > monthlyPrice ) {
			savings = Math.floor( ( 100 * ( monthlyPlanPrice - monthlyPrice ) ) / monthlyPlanPrice );
		}
	}

	return (
		<div className="selected-plan-card">
			<HStack justify="space-between" alignment="center" wrap>
				<Text weight={ 600 }>
					{ translate( '%(planName)s Plan', {
						args: { planName },
						comment: 'Example: Business Plan',
					} ) }
				</Text>
				<HStack justify="flex-start" alignment="center" spacing={ 2 } expanded={ false } wrap>
					{ priceText && <Text variant="muted">{ priceText }</Text> }
					{ savings > 0 && (
						<Badge intent="stable">
							{ translate( 'Save %(savings)d%%', {
								args: { savings },
								comment: 'Example: Save 35%',
								textOnly: true,
							} ) }
						</Badge>
					) }
				</HStack>
			</HStack>
		</div>
	);
}

export default SelectedPlanCard;
