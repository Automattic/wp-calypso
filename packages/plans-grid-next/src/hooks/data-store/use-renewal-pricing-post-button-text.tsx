import {
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	type PlanSlug,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../grid-context';
import type { PlanPricing } from '@automattic/data-stores';
import type { TranslateResult } from 'i18n-calypso';

interface UseRenewalPricingPostButtonTextProps {
	planSlug: PlanSlug;
	pricing?: PlanPricing | null;
}

export default function useRenewalPricingPostButtonText( {
	planSlug,
	pricing,
}: UseRenewalPricingPostButtonTextProps ): TranslateResult | null {
	const translate = useTranslate();
	const { renewalPricingVariation, enableCategorisedFeatures } = usePlansGridContext();

	// Only show in FeaturesGrid (when enableCategorisedFeatures is true) and when in experiment
	if ( ! renewalPricingVariation || ! enableCategorisedFeatures || ! pricing ) {
		return null;
	}

	const { currencyCode, discountedPrice, originalPrice, billingPeriod, introOffer } = pricing;

	// Don't show for free or enterprise plans
	if ( isWpComFreePlan( planSlug ) || isWpcomEnterpriseGridPlan( planSlug ) ) {
		return null;
	}

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
	if ( renewalPricingVariation === 'crossed_price' ) {
		return translate( 'Auto-renews at %(price)s per month. Billed every %(months)s months.', {
			args: {
				price: formattedMonthlyPrice,
				months: billingMonths,
			},
			comment:
				'%(price)s is a formatted price like $10, %(months)s is the billing period in months (12, 24, or 36)',
		} );
	} else if ( renewalPricingVariation === 'no_crossed_price' ) {
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
