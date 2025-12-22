import {
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/number-formatters';
import type { Plans as PlansType } from '@automattic/data-stores';
import type { TranslateResult } from 'i18n-calypso';

interface GetRenewalPricingTextParams {
	pricing: PlansType.PricingMetaForGridPlan;
	showBillingDescriptionForIncreasedRenewalPrice: string | null | undefined;
	translate: ( text: string, options?: any ) => TranslateResult;
}

/**
 * Generates renewal pricing text based on the pricing variation.
 * This is shared between use-plan-billing-description and use-renewal-pricing-post-button-text.
 */
export function getRenewalPricingText( {
	pricing,
	showBillingDescriptionForIncreasedRenewalPrice,
	translate,
}: GetRenewalPricingTextParams ): TranslateResult | null {
	const { currencyCode, discountedPrice, originalPrice, billingPeriod, introOffer } = pricing;

	const monthlyPrice = originalPrice?.monthly;
	const currentFullPrice =
		introOffer?.rawPrice?.full || discountedPrice?.full || originalPrice?.full;

	if ( ! monthlyPrice || ! currencyCode || ! currentFullPrice ) {
		return null;
	}

	const formattedMonthlyPrice = formatCurrency( monthlyPrice, currencyCode, {
		stripZeros: true,
		isSmallestUnit: true,
	} );

	const formattedFullPrice = formatCurrency( currentFullPrice, currencyCode, {
		stripZeros: true,
		isSmallestUnit: true,
	} );

	// Determine the billing period in months
	let billingMonths = 12; // default to annual

	if ( billingPeriod === PLAN_BIENNIAL_PERIOD ) {
		billingMonths = 24;
	} else if ( billingPeriod === PLAN_TRIENNIAL_PERIOD ) {
		billingMonths = 36;
	} else if ( billingPeriod === PLAN_ANNUAL_PERIOD ) {
		billingMonths = 12;
	}

	// Different text based on variation
	if ( showBillingDescriptionForIncreasedRenewalPrice === 'crossed_price' ) {
		return translate( 'Auto-renews at %(price)s per month. Billed every %(months)s months.', {
			args: {
				price: formattedMonthlyPrice,
				months: billingMonths,
			},
			comment:
				'%(price)s is a formatted price like $10, %(months)s is the billing period in months (12, 24, or 36)',
		} );
	} else if ( showBillingDescriptionForIncreasedRenewalPrice === 'no_crossed_price' ) {
		return translate(
			'Get %(months)s months for %(fullPrice)s. Auto-renews at %(price)s per month.',
			{
				args: {
					months: billingMonths,
					fullPrice: formattedFullPrice,
					price: formattedMonthlyPrice,
				},
				comment:
					'%(months)s is the billing period (12, 24, or 36), %(fullPrice)s is the current/intro total price like $100, %(price)s is the renewal monthly price like $12',
			}
		);
	}

	return null;
}
