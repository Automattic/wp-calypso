import {
	getPlan,
	getPlanSlugForTermVariant,
	isWpcomEnterpriseGridPlan,
	PlanSlug,
	TERM_ANNUALLY,
} from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import PlanPrice from 'calypso/my-sites/plan-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getDiscountedRawPrice, getPlanRawPrice } from 'calypso/state/plans/selectors';
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
	const { planName, rawPrice, discountPrice, showMonthlyPrice } = planProperties;
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const siteId = useSelector( getSelectedSiteId ) ?? undefined;

	const planYearlyVariantSlug =
		getPlanSlugForTermVariant( planName as PlanSlug, TERM_ANNUALLY ) ?? '';
	const planYearlyVariant = getPlan( planYearlyVariantSlug );
	const planYearlyVariantProductId = planYearlyVariant?.getProductId();
	const planYearlyVariantRawPrice = useSelector( ( state ) =>
		planYearlyVariantProductId == null
			? null
			: getPlanRawPrice( state, planYearlyVariantProductId, showMonthlyPrice )
	);
	const discountedRawPrice = useSelector( ( state ) =>
		planYearlyVariantProductId == null
			? null
			: getDiscountedRawPrice( state, planYearlyVariantProductId, showMonthlyPrice )
	);
	const planDiscountedRawPrice = useSelector( ( state ) =>
		getPlanDiscountedRawPrice( state, siteId, planYearlyVariantSlug, {
			isMonthly: showMonthlyPrice,
		} )
	);
	const planYearlyVariantDiscountPrice = siteId ? planDiscountedRawPrice : discountedRawPrice;

	console.log(
		planName,
		rawPrice,
		discountPrice,
		planYearlyVariantSlug,
		planYearlyVariantRawPrice,
		planYearlyVariantDiscountPrice
	);

	if ( isWpcomEnterpriseGridPlan( planName ) ) {
		return null;
	}

	return (
		<div className="plan-features-2023-grid__pricing">
			{ discountPrice && (
				<span className="plan-features-2023-grid__header-price-group">
					<div className="plan-features-2023-grid__header-price-group-prices">
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ rawPrice ?? 0 }
							displayPerMonthNotation={ false }
							is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
							isLargeCurrency={ isLargeCurrency }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ discountPrice }
							displayPerMonthNotation={ false }
							is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
							isLargeCurrency={ isLargeCurrency }
							discounted
						/>
					</div>
				</span>
			) }
			{ ! discountPrice && (
				<PlanPrice
					currencyCode={ currencyCode }
					rawPrice={ rawPrice ?? 0 }
					displayPerMonthNotation={ false }
					is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
					isLargeCurrency={ isLargeCurrency }
				/>
			) }
		</div>
	);
};

export default PlanFeatures2023GridHeaderPrice;
