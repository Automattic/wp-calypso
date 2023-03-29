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

const HeaderPriceContainer = styled.div`
	padding: 0 20px;
	margin: 0 0 4px 0;

	.plan-comparison-grid & {
		padding: 0;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.plan-price {
		color: var( --studio-gray-100 );
		margin: 0;
		line-height: 1;
		display: flex;
		font-family: Recoleta, sans-serif;
	}

	.plan-price__currency-symbol,
	.plan-price.is-discounted .plan-price__currency-symbol {
		font-size: 14px;
		color: var( --studio-gray-100 );
		margin-top: 2px;
	}

	.plan-price__integer {
		font-size: 44px;
	}

	.plan-price__term {
		font-size: 12px;
		font-weight: 400;
	}

	.plan-price.is-original {
		color: var( --studio-gray-20 );

		text-decoration: line-through;
		text-decoration-thickness: 1px;
		font-family: 'SF Pro Text', sans-serif;
		margin-bottom: 5px;
		font-size: 18px;

		&::before {
			display: none;
		}

		.plan-price__currency-symbol,
		.plan-price__tax-amount {
			color: var( --color-text-subtle );
		}

		.plan-price__integer {
			font-size: 18px;
		}
		.plan-price__currency-symbol {
			font-size: 8px;
		}
	}

	.plan-price.is-discounted {
		color: var( --color-neutral-70 );

		.plan-price__integer-fraction {
			color: inherit;
		}
	}

	.plan-price.is-large-currency {
		.plan-price__integer {
			font-size: 38px;
		}
		&.is-original {
			.plan-price__integer {
				font-size: 16px;
			}
		}
	}
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
		<HeaderPriceContainer>
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
		</HeaderPriceContainer>
	);
};

export default PlanFeatures2023GridHeaderPrice;
