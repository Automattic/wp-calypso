import {
	getPlanSlugForTermVariant,
	isWpcomEnterpriseGridPlan,
	PlanSlug,
	TERM_ANNUALLY,
	PLAN_BIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import PlanPrice from 'calypso/my-sites/plan-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import usePlanPrices from './hooks/use-plan-prices';
import { PlanProperties } from './types';

interface PlanFeatures2023GridHeaderPriceProps {
	planProperties: PlanProperties;
	is2023OnboardingPricingGrid: boolean;
	isLargeCurrency: boolean;
}

const PlanFeatures2023GridHeaderPrice = ( {
	planProperties,
	is2023OnboardingPricingGrid,
	isLargeCurrency,
}: PlanFeatures2023GridHeaderPriceProps ) => {
	const { planName, showMonthlyPrice, billingPeriod } = planProperties;
	const isBiannualPlan = PLAN_BIENNIAL_PERIOD === billingPeriod;
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const planPrices = usePlanPrices( {
		planSlug: planName as PlanSlug,
		monthly: showMonthlyPrice,
	} );
	const planYearlyVariantPrices = usePlanPrices( {
		planSlug:
			getPlanSlugForTermVariant( planName as PlanSlug, TERM_ANNUALLY ) ?? ( '' as PlanSlug ),
		monthly: showMonthlyPrice,
	} );

	// biannual plans always show discounted pricing, irrespective of whether the plan has a discount
	const showDiscountedPricing = Boolean(
		isBiannualPlan || planPrices.planDiscountedRawPrice || planPrices.discountedRawPrice
	);

	// order matters here, we want to show the discounted price if it exists, otherwise the regular price
	const priceToDisplay =
		planPrices.planDiscountedRawPrice || planPrices.discountedRawPrice || planPrices.rawPrice;

	// order matters here, we want to show the yearly variant's discounted price if it exists, otherwise [planName]'s raw price
	const crossoutPriceToDisplay = isBiannualPlan
		? planYearlyVariantPrices.planDiscountedRawPrice ||
		  planYearlyVariantPrices.discountedRawPrice ||
		  planYearlyVariantPrices.rawPrice
		: planPrices.rawPrice;

	if ( isWpcomEnterpriseGridPlan( planName ) ) {
		return null;
	}

	return (
		<div className="plan-features-2023-grid__pricing">
			{ showDiscountedPricing && (
				<span className="plan-features-2023-grid__header-price-group">
					<div className="plan-features-2023-grid__header-price-group-prices">
						{ 0 < crossoutPriceToDisplay && (
							<PlanPrice
								currencyCode={ currencyCode }
								rawPrice={ crossoutPriceToDisplay }
								displayPerMonthNotation={ false }
								is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
								isLargeCurrency={ isLargeCurrency }
								original
							/>
						) }
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ priceToDisplay }
							displayPerMonthNotation={ false }
							is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
							isLargeCurrency={ isLargeCurrency }
							discounted
						/>
					</div>
				</span>
			) }
			{ ! showDiscountedPricing && (
				<PlanPrice
					currencyCode={ currencyCode }
					rawPrice={ priceToDisplay }
					displayPerMonthNotation={ false }
					is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
					isLargeCurrency={ isLargeCurrency }
				/>
			) }
		</div>
	);
};

export default PlanFeatures2023GridHeaderPrice;
