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
	const { currencyCode, discountedPrice, originalPrice, billingPeriod, introOffer, renewalPrice } =
		pricing;

	const monthlyPrice = renewalPrice?.monthly ?? originalPrice?.monthly;
	// Use the discounted price before the intro offer price since the discount is applied on top of it.
	const currentFullPrice =
		discountedPrice?.full || introOffer?.rawPrice?.full || originalPrice?.full;

	if ( ! monthlyPrice || ! currencyCode || ! currentFullPrice ) {
		return null;
	}

	const formattedMonthlyPrice = formatCurrency( monthlyPrice, currencyCode, {
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

	// Renewal pricing experiment: crossed-price copy for all active variants
	if ( showBillingDescriptionForIncreasedRenewalPrice ) {
		return translate( 'Auto-renews at %(price)s per month. Billed every %(months)s months.', {
			args: {
				price: formattedMonthlyPrice,
				months: billingMonths,
			},
			comment:
				'%(price)s is a formatted price like $10, %(months)s is the billing period in months (12, 24, or 36)',
		} );
	}

	return null;
}
