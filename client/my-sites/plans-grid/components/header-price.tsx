import { isWpcomEnterpriseGridPlan, type PlanSlug } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import PlanPrice from 'calypso/my-sites/plan-price';
import { usePlansGridContext } from '../grid-context';
import type { GridPlan } from '../hooks/npm-ready/data-store/use-grid-plans';

interface PlanFeatures2023GridHeaderPriceProps {
	planSlug: PlanSlug;
	isLargeCurrency: boolean;
	isPlanUpgradeCreditEligible: boolean;
	currentSitePlanSlug?: string | null;
	siteId?: number | null;
	visibleGridPlans: GridPlan[];
}

const PricesGroup = styled.div< { isLargeCurrency: boolean } >`
	justify-content: flex-end;
	display: flex;
	flex-direction: ${ ( props ) => ( props.isLargeCurrency ? 'column' : 'row-reverse' ) };
	align-items: ${ ( props ) => ( props.isLargeCurrency ? 'flex-start' : 'flex-end' ) };
	gap: 4px;
`;

const Badge = styled.div< { isForIntroOffer?: boolean; isHidden?: boolean } >`
	text-align: center;
	white-space: nowrap;
	font-size: 0.75rem;
	line-height: 1.25rem;
	border-radius: 4px;
	height: 21px;
	display: inline-block;
	width: fit-content;
	letter-spacing: ${ ( { isForIntroOffer } ) => ( isForIntroOffer ? 'inherit' : '0.2px' ) };
	font-weight: ${ ( { isForIntroOffer } ) => ( isForIntroOffer ? 600 : 500 ) };
	text-align: ${ ( { isForIntroOffer } ) => ( isForIntroOffer ? 'left' : 'center' ) };
	padding: ${ ( { isForIntroOffer } ) => ( isForIntroOffer ? 0 : '0 12px' ) };
	background-color: ${ ( { isForIntroOffer } ) =>
		isForIntroOffer ? 'inherit' : 'var( --studio-green-0 )' };
	color: ${ ( { isForIntroOffer } ) =>
		isForIntroOffer ? 'var( --studio-blue-50 )' : 'var( --studio-green-40 )' };
	text-transform: ${ ( { isForIntroOffer } ) => ( isForIntroOffer ? 'uppercase' : 'none' ) };
	visibility: ${ ( { isHidden } ) => ( isHidden ? 'hidden' : 'visible' ) };
`;

const HeaderPriceContainer = styled.div`
	padding: 0 20px;
	margin: 0 0 4px 0;

	.plan-comparison-grid & {
		padding: 0;
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

		.plans-grid-2023__html-price-display-wrapper {
			color: inherit;
		}
	}

	.plan-price.is-large-currency {
		.plan-price__integer {
			font-size: 28px;
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
	planSlug,
	isLargeCurrency,
	isPlanUpgradeCreditEligible,
	visibleGridPlans,
}: PlanFeatures2023GridHeaderPriceProps ) => {
	const translate = useTranslate();
	const { gridPlansIndex } = usePlansGridContext();
	const {
		current,
		pricing: { currencyCode, originalPrice, discountedPrice, introOffer },
	} = gridPlansIndex[ planSlug ];
	const shouldShowDiscountedPrice = Boolean( discountedPrice.monthly );
	const isAnyVisibleGridPlanDiscounted = visibleGridPlans.some(
		( { pricing } ) => pricing.discountedPrice.monthly
	);
	const isPricedPlan = null !== originalPrice.monthly;
	const shouldShowIntroPricing = introOffer && ! introOffer.isOfferComplete;

	if ( isWpcomEnterpriseGridPlan( planSlug ) ) {
		return null;
	}

	return (
		<>
			{ isPricedPlan ? (
				<HeaderPriceContainer>
					{ shouldShowIntroPricing ? (
						<>
							{ ! current && (
								<Badge className="plan-features-2023-grid__badge" isForIntroOffer={ true }>
									{ translate( 'Limited Time Offer' ) }
								</Badge>
							) }
							<PlanPrice
								currencyCode={ currencyCode }
								rawPrice={ introOffer.rawPrice }
								displayPerMonthNotation={ false }
								isLargeCurrency={ isLargeCurrency }
								isSmallestUnit={ false }
								priceDisplayWrapperClassName="plans-grid-2023__html-price-display-wrapper"
							/>
						</>
					) : (
						<>
							{ shouldShowDiscountedPrice ? (
								<>
									<Badge className="plan-features-2023-grid__badge">
										{ isPlanUpgradeCreditEligible
											? translate( 'Credit applied' )
											: translate( 'One time discount' ) }
									</Badge>
									<PricesGroup isLargeCurrency={ isLargeCurrency }>
										<PlanPrice
											currencyCode={ currencyCode }
											rawPrice={ originalPrice.monthly }
											displayPerMonthNotation={ false }
											isLargeCurrency={ isLargeCurrency }
											isSmallestUnit={ true }
											priceDisplayWrapperClassName="plans-grid-2023__html-price-display-wrapper"
											original
										/>
										<PlanPrice
											currencyCode={ currencyCode }
											rawPrice={ discountedPrice.monthly }
											displayPerMonthNotation={ false }
											isLargeCurrency={ isLargeCurrency }
											isSmallestUnit={ true }
											priceDisplayWrapperClassName="plans-grid-2023__html-price-display-wrapper"
											discounted
										/>
									</PricesGroup>
								</>
							) : (
								<>
									{ isAnyVisibleGridPlanDiscounted && (
										<Badge className="plan-features-2023-grid__badge" isHidden={ true }></Badge>
									) }
									<PlanPrice
										currencyCode={ currencyCode }
										rawPrice={ originalPrice.monthly }
										displayPerMonthNotation={ false }
										isLargeCurrency={ isLargeCurrency }
										isSmallestUnit={ true }
										priceDisplayWrapperClassName="plans-grid-2023__html-price-display-wrapper"
									/>
								</>
							) }
						</>
					) }
				</HeaderPriceContainer>
			) : null }
		</>
	);
};

export default PlanFeatures2023GridHeaderPrice;
