import {
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	PLAN_BIENNIAL_PERIOD,
	PLAN_ANNUAL_PERIOD,
	PlanSlug,
	getPlanSlugForTermVariant,
	TERM_ANNUALLY,
	isWooExpressPlan,
	getPlans,
	isWooExpressMediumPlan,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM,
	isWooExpressSmallPlan,
	PLAN_WOOEXPRESS_SMALL_MONTHLY,
	PLAN_WOOEXPRESS_SMALL,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import i18n, { localize, TranslateResult, useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import usePlanPrices from 'calypso/my-sites/plans/hooks/use-plan-prices';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';

interface Props {
	planName: string;
	billingTimeframe: TranslateResult;
	billingPeriod: number | null | undefined;
	isMonthlyPlan: boolean;
}

export const StrikethroughText = styled.span`
	color: var( --studio-gray-20 );
	text-decoration: line-through;
`;

function usePerMonthDescription( {
	isMonthlyPlan,
	planName,
	billingPeriod,
}: Omit< Props, 'billingTimeframe' > ) {
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const isEnglishLocale = useIsEnglishLocale();
	const planPrices = usePlanPrices( {
		planSlug: planName as PlanSlug,
		returnMonthly: isMonthlyPlan,
	} );
	const planYearlyVariantPricesPerMonth = usePlanPrices( {
		planSlug:
			getPlanSlugForTermVariant( planName as PlanSlug, TERM_ANNUALLY ) ?? ( '' as PlanSlug ),
		returnMonthly: true,
	} );

	if ( isWpComFreePlan( planName ) || isWpcomEnterpriseGridPlan( planName ) ) {
		return null;
	}

	if ( isMonthlyPlan ) {
		// We want `yearlyVariantMaybeDiscountedPricePerMonth` to be the raw price the user
		// would pay if they choose an annual plan instead of the monthly one. So pro-rated
		// (or site-plan specific) credits should not be taken into account.
		const yearlyVariantMaybeDiscountedPricePerMonth =
			planYearlyVariantPricesPerMonth.discountedRawPrice ||
			planYearlyVariantPricesPerMonth.rawPrice;

		if ( yearlyVariantMaybeDiscountedPricePerMonth < planPrices.rawPrice ) {
			return translate( `Save %(discountRate)s%% by paying annually`, {
				args: {
					discountRate: Math.floor(
						( 100 * ( planPrices.rawPrice - yearlyVariantMaybeDiscountedPricePerMonth ) ) /
							planPrices.rawPrice
					),
				},
			} );
		}
	}

	if ( ! isMonthlyPlan ) {
		const discountedPrice = planPrices.planDiscountedRawPrice || planPrices.discountedRawPrice;
		const fullTermDiscountedPriceText =
			currencyCode && discountedPrice
				? formatCurrency( discountedPrice, currencyCode, { stripZeros: true } )
				: null;
		const rawPrice =
			currencyCode && planPrices.rawPrice
				? formatCurrency( planPrices.rawPrice, currencyCode, { stripZeros: true } )
				: null;

		// TODO: Remove check once text is translated
		const displayNewPriceText =
			isEnglishLocale ||
			( i18n.hasTranslation( 'per month, %(rawPrice)s billed annually, Excl. Taxes' ) &&
				i18n.hasTranslation( 'per month, %(rawPrice)s billed every two years, Excl. Taxes' ) &&
				i18n.hasTranslation(
					'per month, {{discount}} %(rawPrice)s billed annually{{/discount}} %(fullTermDiscountedPriceText)s for the first year, Excl. Taxes'
				) &&
				i18n.hasTranslation(
					'per month, {{discount}} %(rawPrice)s billed annually{{/discount}} %(fullTermDiscountedPriceText)s for the first year, Excl. Taxes'
				) );
		if ( fullTermDiscountedPriceText ) {
			if ( PLAN_ANNUAL_PERIOD === billingPeriod ) {
				//per month, $96 billed annually $84 for the first year

				return displayNewPriceText
					? translate(
							'per month, {{discount}} %(rawPrice)s billed annually{{/discount}} %(fullTermDiscountedPriceText)s for the first year, Excl. Taxes',
							{
								args: { fullTermDiscountedPriceText, rawPrice },
								components: {
									discount: <StrikethroughText />,
								},
								comment: 'Excl. Taxes is short for excluding taxes',
							}
					  )
					: translate(
							'per month, {{discount}} %(rawPrice)s billed annually{{/discount}} %(fullTermDiscountedPriceText)s for the first year',
							{
								args: { fullTermDiscountedPriceText, rawPrice },
								components: {
									discount: <StrikethroughText />,
								},
							}
					  );
			}

			if ( PLAN_BIENNIAL_PERIOD === billingPeriod ) {
				return displayNewPriceText
					? translate(
							'per month, {{discount}} %(rawPrice)s billed annually{{/discount}} %(fullTermDiscountedPriceText)s for the first year, Excl. Taxes',
							{
								args: { fullTermDiscountedPriceText, rawPrice },
								components: {
									discount: <StrikethroughText />,
								},
								comment: 'Excl. Taxes is short for excluding taxes',
							}
					  )
					: translate(
							'per month, {{discount}} %(rawPrice)s billed annually{{/discount}} %(fullTermDiscountedPriceText)s for the first year',
							{
								args: { fullTermDiscountedPriceText, rawPrice },
								components: {
									discount: <StrikethroughText />,
								},
							}
					  );
			}
		} else if ( rawPrice ) {
			if ( PLAN_ANNUAL_PERIOD === billingPeriod ) {
				return displayNewPriceText
					? translate( 'per month, %(rawPrice)s billed annually, Excl. Taxes', {
							args: { rawPrice },
							comment: 'Excl. Taxes is short for excluding taxes',
					  } )
					: translate( 'per month, %(rawPrice)s billed annually', {
							args: { rawPrice },
					  } );
			}

			if ( PLAN_BIENNIAL_PERIOD === billingPeriod ) {
				return displayNewPriceText
					? translate( 'per month, %(rawPrice)s billed every two years, Excl. Taxes', {
							args: { rawPrice },
							comment: 'Excl. Taxes is short for excluding taxes',
					  } )
					: translate( 'per month, %(rawPrice)s billed every two years.', {
							args: { rawPrice },
					  } );
			}
		}
	}

	return null;
}

interface WooExpressMonthlyPromotionProps {
	billingTimeframe: TranslateResult;
	monthlyPlanSlug: string;
	yearlyPlanSlug: string;
}

const WooExpressMonthlyPromotion: FunctionComponent< WooExpressMonthlyPromotionProps > = (
	props
) => {
	const translate = useTranslate();
	const { billingTimeframe, yearlyPlanSlug, monthlyPlanSlug } = props;

	const annualPlan = getPlans()[ yearlyPlanSlug ];
	const monthlyPlan = getPlans()[ monthlyPlanSlug ];
	const planPrices = useSelector( ( state ) => ( {
		annualPlanMonthlyPrice: getPlanRawPrice( state, annualPlan.getProductId(), true ) || 0,
		monthlyPlanPrice: getPlanRawPrice( state, monthlyPlan.getProductId() ) || 0,
	} ) );

	const percentageSavings = Math.round(
		( 1 - planPrices.annualPlanMonthlyPrice / planPrices.monthlyPlanPrice ) * 100
	);
	const discountDescription = percentageSavings
		? translate( `Save %(percentageSavings)s%% by paying annually`, {
				args: {
					percentageSavings,
				},
				comment: 'Translators: percentageSavings is the percentage saved by paying annually',
		  } )
		: null;
	return (
		<div>
			<div>{ billingTimeframe }</div>
			<div className="plan-features-2023-grid__discount-promotion">{ discountDescription }</div>
		</div>
	);
};

/**
 * Retrieves the monthly and yearly plan slugs for a given WooExpress plan name.
 *
 * @param planName - The name of the WooExpress plan to retrieve slugs for.
 * @returns An object containing the monthly and yearly plan slugs, or an empty object if the plan name is invalid.
 */
function getWooExpressPlanSlugs( planName: string ) {
	let monthlyPlanSlug = null;
	let yearlyPlanSlug = null;

	if ( isWooExpressMediumPlan( planName ) ) {
		monthlyPlanSlug = PLAN_WOOEXPRESS_MEDIUM_MONTHLY;
		yearlyPlanSlug = PLAN_WOOEXPRESS_MEDIUM;
	} else if ( isWooExpressSmallPlan( planName ) ) {
		monthlyPlanSlug = PLAN_WOOEXPRESS_SMALL_MONTHLY;
		yearlyPlanSlug = PLAN_WOOEXPRESS_SMALL;
	} else {
		return {};
	}
	return { monthlyPlanSlug, yearlyPlanSlug };
}

const PlanFeatures2023GridBillingTimeframe: FunctionComponent< Props > = ( props ) => {
	const { planName, billingTimeframe, isMonthlyPlan } = props;
	const translate = useTranslate();
	const perMonthDescription = usePerMonthDescription( props ) || billingTimeframe;
	const price = formatCurrency( 25000, 'USD' );

	if ( isWooExpressPlan( planName ) && isMonthlyPlan ) {
		const wooExpressPlansSlugs = getWooExpressPlanSlugs( planName );
		if ( wooExpressPlansSlugs.monthlyPlanSlug && wooExpressPlansSlugs.yearlyPlanSlug ) {
			const wooExpressMonthlyPromotionProps = {
				billingTimeframe,
				...wooExpressPlansSlugs,
			};
			return <WooExpressMonthlyPromotion { ...wooExpressMonthlyPromotionProps } />;
		}
	}

	if ( isWpcomEnterpriseGridPlan( planName ) ) {
		return (
			<div className="plan-features-2023-grid__vip-price">
				{ translate( 'Starts at {{b}}%(price)s{{/b}} yearly', {
					args: { price },
					components: { b: <b /> },
					comment: 'Translators: the price is in US dollars for all users (US$25,000)',
				} ) }
			</div>
		);
	}

	return <div>{ perMonthDescription }</div>;
};

export default localize( PlanFeatures2023GridBillingTimeframe );
