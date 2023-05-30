import { isWpcomEnterpriseGridPlan, PlanSlug } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import PlanPrice from 'calypso/my-sites/plan-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { usePlanPricesDisplay } from '../hooks/use-plan-prices-display';
import type { PlanProperties } from '../types';

interface PlanFeatures2023GridHeaderPriceProps {
	planProperties: PlanProperties;
	isLargeCurrency: boolean;
	isPlanUpgradeCreditEligible: boolean;
	currentSitePlanSlug?: string;
	siteId?: number | null;
}

const PricesGroup = styled.div< { isLargeCurrency: boolean } >`
	justify-content: flex-end;
	display: flex;
	flex-direction: ${ ( props ) => ( props.isLargeCurrency ? 'column' : 'row-reverse' ) };
	align-items: ${ ( props ) => ( props.isLargeCurrency ? 'flex-start' : 'flex-end' ) };
	gap: 4px;
`;

const Badge = styled.div`
	text-align: center;
	white-space: nowrap;
	font-size: 0.75rem;
	font-weight: 500;
	letter-spacing: 0.2px;
	line-height: 1.25rem;
	padding: 0 12px;
	border-radius: 4px;
	height: 21px;
	background-color: var( --studio-green-0 );
	display: inline-block;
	color: var( --studio-green-40 );
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
			font-size: 30px;
		}
		&.is-original {
			.plan-price__integer {
				font-size: 16px;
			}
		}
	}
	.plan-features-2023-grid__badge {
		margin-bottom: 10px;
	}
`;

const PlanFeatures2023GridHeaderPrice = ( {
	planProperties,
	isLargeCurrency,
	isPlanUpgradeCreditEligible,
	currentSitePlanSlug,
	siteId,
}: PlanFeatures2023GridHeaderPriceProps ) => {
	const translate = useTranslate();
	const { planName, showMonthlyPrice } = planProperties;
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const planPrices = usePlanPricesDisplay( {
		planSlug: planName as PlanSlug,
		returnMonthly: showMonthlyPrice,
		currentSitePlanSlug,
		siteId,
	} );
	const shouldShowDiscountedPrice = Boolean( planPrices.discountedPrice );

	if ( isWpcomEnterpriseGridPlan( planName ) ) {
		return null;
	}

	return (
		<HeaderPriceContainer>
			{ shouldShowDiscountedPrice && (
				<>
					<Badge className="plan-features-2023-grid__badge">
						{ isPlanUpgradeCreditEligible
							? translate( 'Credit applied' )
							: translate( 'One time discount' ) }
					</Badge>
					<PricesGroup isLargeCurrency={ isLargeCurrency }>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ planPrices.originalPrice }
							displayPerMonthNotation={ false }
							isLargeCurrency={ isLargeCurrency }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ planPrices.discountedPrice }
							displayPerMonthNotation={ false }
							isLargeCurrency={ isLargeCurrency }
							discounted
						/>
					</PricesGroup>
				</>
			) }
			{ ! shouldShowDiscountedPrice && (
				<PlanPrice
					currencyCode={ currencyCode }
					rawPrice={ planPrices.originalPrice }
					displayPerMonthNotation={ false }
					isLargeCurrency={ isLargeCurrency }
				/>
			) }
		</HeaderPriceContainer>
	);
};

export default PlanFeatures2023GridHeaderPrice;
