import {
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	PLAN_BIENNIAL_PERIOD,
	PLAN_ANNUAL_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
	PlanSlug,
	getPlanSlugForTermVariant,
	TERM_ANNUALLY,
	isWooExpressPlan,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import styled from '@emotion/styled';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { usePlanPricesDisplay } from '../hooks/use-plan-prices-display';

interface Props {
	planName: string;
	billingTimeframe: TranslateResult;
	billingPeriod: number | null | undefined;
	isMonthlyPlan: boolean;
	currentSitePlanSlug?: string | null;
	siteId?: number | null;
	storageForPlan: string;
	storageAddOns: [];
}

function usePerMonthDescription( {
	isMonthlyPlan,
	planName,
	billingPeriod,
	currentSitePlanSlug,
	siteId,
	storageAddOns,
	storageForPlan,
}: Omit< Props, 'billingTimeframe' > ) {
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	// We don't support monthly terms for storage add ons
	const storageAddOnCost = ! isMonthlyPlan
		? storageAddOns.find( ( addOn ) => {
				return addOn.featureSlugs.includes( storageForPlan );
		  } )?.costData?.yearlyCost
		: 0;
	const planPrices = usePlanPricesDisplay( {
		planSlug: planName as PlanSlug,
		returnMonthly: isMonthlyPlan,
		currentSitePlanSlug,
		siteId,
		addOnCosts: [ storageAddOnCost ],
	} );

	// We want `planYearlyVariantPricesPerMonth` to be the raw price the user
	// would pay if they choose an annual plan instead of the monthly one. So pro-rated
	// (or site-plan specific) credits should not be taken into account.
	const planYearlyVariantPricesPerMonth = usePlanPricesDisplay( {
		planSlug:
			getPlanSlugForTermVariant( planName as PlanSlug, TERM_ANNUALLY ) ?? ( '' as PlanSlug ),
		returnMonthly: true,
		currentSitePlanSlug,
		siteId,
		withoutProRatedCredits: true,
		addOnCosts: [ storageAddOnCost ],
	} );

	if ( isWpComFreePlan( planName ) || isWpcomEnterpriseGridPlan( planName ) ) {
		return null;
	}

	if ( isMonthlyPlan ) {
		const yearlyVariantMaybeDiscountedPricePerMonth =
			planYearlyVariantPricesPerMonth.discountedPrice ||
			planYearlyVariantPricesPerMonth.originalPrice;

		if ( yearlyVariantMaybeDiscountedPricePerMonth < planPrices.originalPrice ) {
			return translate( `Save %(discountRate)s%% by paying annually`, {
				args: {
					discountRate: Math.floor(
						( 100 * ( planPrices.originalPrice - yearlyVariantMaybeDiscountedPricePerMonth ) ) /
							planPrices.originalPrice
					),
				},
			} );
		}
		return null;
	}

	const discountedPrice = planPrices.discountedPrice;
	const fullTermDiscountedPriceText =
		currencyCode && discountedPrice
			? formatCurrency( discountedPrice, currencyCode, { stripZeros: true } )
			: null;
	const rawPrice =
		currencyCode && planPrices.originalPrice
			? formatCurrency( planPrices.originalPrice, currencyCode, { stripZeros: true } )
			: null;

	if ( fullTermDiscountedPriceText ) {
		if ( PLAN_ANNUAL_PERIOD === billingPeriod ) {
			return translate(
				'per month, %(fullTermDiscountedPriceText)s for the first year, Excl. Taxes',
				{
					args: { fullTermDiscountedPriceText },
					comment: 'Excl. Taxes is short for excluding taxes',
				}
			);
		}

		if ( PLAN_BIENNIAL_PERIOD === billingPeriod ) {
			return translate(
				'per month, %(fullTermDiscountedPriceText)s for the first two years, Excl. Taxes',
				{
					args: { fullTermDiscountedPriceText },
					comment: 'Excl. Taxes is short for excluding taxes',
				}
			);
		}

		if ( PLAN_TRIENNIAL_PERIOD === billingPeriod ) {
			return translate(
				'per month, %(fullTermDiscountedPriceText)s for the first three years, Excl. Taxes',
				{
					args: { fullTermDiscountedPriceText },
					comment: 'Excl. Taxes is short for excluding taxes',
				}
			);
		}
	} else if ( rawPrice ) {
		if ( PLAN_ANNUAL_PERIOD === billingPeriod ) {
			return translate( 'per month, %(rawPrice)s billed annually, Excl. Taxes', {
				args: { rawPrice },
				comment: 'Excl. Taxes is short for excluding taxes',
			} );
		}

		if ( PLAN_BIENNIAL_PERIOD === billingPeriod ) {
			return translate( 'per month, %(rawPrice)s billed every two years, Excl. Taxes', {
				args: { rawPrice },
				comment: 'Excl. Taxes is short for excluding taxes',
			} );
		}

		if ( PLAN_TRIENNIAL_PERIOD === billingPeriod ) {
			return translate( 'per month, %(rawPrice)s billed every three years, Excl. Taxes', {
				args: { rawPrice },
				comment: 'Excl. Taxes is short for excluding taxes',
			} );
		}
	}

	return null;
}

const DiscountPromotion = styled.div`
	text-transform: uppercase;
	font-weight: 600;
	color: #306e27;
	font-size: $font-body-extra-small;
	margin-top: 6px;
`;

const PlanFeatures2023GridBillingTimeframe: FunctionComponent< Props > = ( props ) => {
	const { planName, billingTimeframe, isMonthlyPlan } = props;
	const translate = useTranslate();
	const perMonthDescription = usePerMonthDescription( props );
	const description = perMonthDescription || billingTimeframe;
	const price = formatCurrency( 25000, 'USD' );

	if ( isWooExpressPlan( planName ) && isMonthlyPlan ) {
		return (
			<div>
				<div>{ billingTimeframe }</div>
				<DiscountPromotion>{ perMonthDescription }</DiscountPromotion>
			</div>
		);
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

	return <div>{ description }</div>;
};

export default PlanFeatures2023GridBillingTimeframe;
