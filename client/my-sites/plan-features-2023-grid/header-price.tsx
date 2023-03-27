import { isWpcomEnterpriseGridPlan, PlanSlug } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import PlanPrice from 'calypso/my-sites/plan-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import usePlanPrices from '../plans/hooks/use-plan-prices';
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
	const { planName, showMonthlyPrice } = planProperties;
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const planPrices = usePlanPrices( {
		planSlug: planName as PlanSlug,
		monthly: showMonthlyPrice,
	} );
	const shouldShowDiscountedPrice = Boolean(
		planPrices.planDiscountedRawPrice || planPrices.discountedRawPrice
	);
	const discountedPricing = {
		crossoutPrice: shouldShowDiscountedPrice ? planPrices.rawPrice : null,
		price: shouldShowDiscountedPrice
			? planPrices.planDiscountedRawPrice || planPrices.discountedRawPrice
			: planPrices.rawPrice,
	};

	if ( isWpcomEnterpriseGridPlan( planName ) ) {
		return null;
	}

	return (
		<div className="plan-features-2023-grid__pricing">
			{ shouldShowDiscountedPrice && (
				<span className="plan-features-2023-grid__header-price-group">
					<div className="plan-features-2023-grid__header-price-group-prices">
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ discountedPricing.crossoutPrice ?? undefined }
							displayPerMonthNotation={ false }
							is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
							isLargeCurrency={ isLargeCurrency }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ discountedPricing.price }
							displayPerMonthNotation={ false }
							is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
							isLargeCurrency={ isLargeCurrency }
							discounted
						/>
					</div>
				</span>
			) }
			{ ! shouldShowDiscountedPrice && (
				<PlanPrice
					currencyCode={ currencyCode }
					rawPrice={ discountedPricing.price }
					displayPerMonthNotation={ false }
					is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
					isLargeCurrency={ isLargeCurrency }
				/>
			) }
		</div>
	);
};

export default PlanFeatures2023GridHeaderPrice;
