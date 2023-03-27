import { isWpcomEnterpriseGridPlan, PlanSlug } from '@automattic/calypso-products';
import styled from '@emotion/styled';
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

const PricesGroup = styled.div< { isLargeCurrency: boolean } >`
	justify-content: flex-end;
	display: flex;
	flex-direction: ${ ( props ) => ( props.isLargeCurrency ? 'column' : 'row-reverse' ) };
	align-items: ${ ( props ) => ( props.isLargeCurrency ? 'flex-start' : 'flex-end' ) };
	gap: 4px;
`;

const PlanFeatures2023GridHeaderPrice = ( {
	planProperties,
	is2023OnboardingPricingGrid,
	isLargeCurrency,
}: PlanFeatures2023GridHeaderPriceProps ) => {
	const { planName, showMonthlyPrice } = planProperties;
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const planPrices = usePlanPrices( {
		planSlug: planName as PlanSlug,
		returnMonthly: showMonthlyPrice,
	} );
	const shouldShowDiscountedPrice = Boolean(
		planPrices.planDiscountedRawPrice || planPrices.discountedRawPrice
	);

	if ( isWpcomEnterpriseGridPlan( planName ) ) {
		return null;
	}

	return (
		<div className="plan-features-2023-grid__pricing">
			{ shouldShowDiscountedPrice && (
				<PricesGroup isLargeCurrency={ isLargeCurrency }>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ planPrices.rawPrice }
						displayPerMonthNotation={ false }
						is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
						isLargeCurrency={ isLargeCurrency }
						original
					/>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ planPrices.planDiscountedRawPrice || planPrices.discountedRawPrice }
						displayPerMonthNotation={ false }
						is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
						isLargeCurrency={ isLargeCurrency }
						discounted
					/>
				</PricesGroup>
			) }
			{ ! shouldShowDiscountedPrice && (
				<PlanPrice
					currencyCode={ currencyCode }
					rawPrice={ planPrices.rawPrice }
					displayPerMonthNotation={ false }
					is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
					isLargeCurrency={ isLargeCurrency }
				/>
			) }
		</div>
	);
};

export default PlanFeatures2023GridHeaderPrice;
