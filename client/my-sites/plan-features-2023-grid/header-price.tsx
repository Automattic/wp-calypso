import {
	getPlan,
	getPlanSlugForTermVariant,
	isWpcomEnterpriseGridPlan,
	Plan,
	PlanSlug,
	TERM_ANNUALLY,
} from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import PlanPrice from 'calypso/my-sites/plan-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getDiscountedRawPrice, getPlanRawPrice } from 'calypso/state/plans/selectors';
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
	const { planName, rawPrice, discountPrice, showMonthlyPrice, billingPeriod } = planProperties;
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	// TODO CLK Clean up this mess

	const siteId = useSelector( getSelectedSiteId ) ?? undefined;

	const planYearlyVariantSlug =
		getPlanSlugForTermVariant( planName as PlanSlug, TERM_ANNUALLY ) ?? '';
	const planYearlyVariant = getPlan( planYearlyVariantSlug );
	const planYearlyVariantProductId = planYearlyVariant?.getProductId();

	const planPrices = usePlanPrices( [ planYearlyVariant as Plan ] );

	const planYearlyVariantRawPrice = useSelector( ( state ) =>
		planYearlyVariantProductId == null
			? null
			: getPlanRawPrice( state, planYearlyVariantProductId, showMonthlyPrice )
	);
	const planYearlyVariantDiscountedRawPrice = useSelector( ( state ) =>
		planYearlyVariantProductId == null
			? null
			: getDiscountedRawPrice( state, planYearlyVariantProductId, showMonthlyPrice )
	);
	const planYearlyVariantPlanDiscountedRawPrice = useSelector( ( state ) =>
		getPlanDiscountedRawPrice( state, siteId, planYearlyVariantSlug, {
			isMonthly: showMonthlyPrice,
		} )
	);
	const planYearlyVariantDiscountPrice = siteId
		? planYearlyVariantPlanDiscountedRawPrice
		: planYearlyVariantDiscountedRawPrice;

	if ( isWpcomEnterpriseGridPlan( planName ) ) {
		return null;
	}

	const isBiannualPlan = 730 === billingPeriod;
	const showDiscountedPricing = isBiannualPlan || discountPrice;

	const crossoutPriceToDisplay = isBiannualPlan ? discountPrice || rawPrice : rawPrice;

	const priceToDislay = isBiannualPlan
		? planYearlyVariantDiscountPrice || planYearlyVariantRawPrice
		: discountPrice || rawPrice;

	console.log(
		planName,
		rawPrice,
		discountPrice,
		planYearlyVariantSlug,
		planYearlyVariantRawPrice,
		planYearlyVariantDiscountPrice
	);

	return (
		<div className="plan-features-2023-grid__pricing">
			{ showDiscountedPricing && (
				<span className="plan-features-2023-grid__header-price-group">
					<div className="plan-features-2023-grid__header-price-group-prices">
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ priceToDislay ?? 0 }
							displayPerMonthNotation={ false }
							is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
							isLargeCurrency={ isLargeCurrency }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ crossoutPriceToDisplay ?? 0 }
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
					rawPrice={ priceToDislay ?? 0 }
					displayPerMonthNotation={ false }
					is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
					isLargeCurrency={ isLargeCurrency }
				/>
			) }
		</div>
	);
};

export default PlanFeatures2023GridHeaderPrice;
