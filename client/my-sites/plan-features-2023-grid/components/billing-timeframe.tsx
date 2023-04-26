import {
	isWpComFreePlan,
	getPlanSlugForTermVariant,
	PLAN_ENTERPRISE_GRID_WPCOM,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import { useSelect } from '@wordpress/data';
import { localize, TranslateResult, useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import usePlanPrices from 'calypso/my-sites/plans/hooks/use-plan-prices';
import { PLANS_STORE } from 'calypso/my-sites/plans-features-main/store';
import type { PlansSelect, StorePlanSlug } from '@automattic/data-stores';

interface Props {
	planName: StorePlanSlug | typeof PLAN_ENTERPRISE_GRID_WPCOM;
	billingTimeframe: TranslateResult;
	isMonthlyPlan: boolean;
}

function PerMonthDescription( {
	isMonthlyPlan,
	planName,
}: {
	isMonthlyPlan: boolean;
	planName: StorePlanSlug;
} ) {
	const translate = useTranslate();
	const planPrices = usePlanPrices( {
		planSlug: planName,
		returnMonthly: isMonthlyPlan,
	} );
	const planYearlyVariantPricesPerMonth = usePlanPrices( {
		planSlug: getPlanSlugForTermVariant( planName, Plans.TERM_ANNUALLY ) ?? ( '' as StorePlanSlug ),
		returnMonthly: true,
	} );
	const plan = useSelect(
		( select ) => ( select( PLANS_STORE ) as PlansSelect ).getPlanProductByStoreSlug( planName ),
		[ planName ]
	);

	let perMonthDescription = null;

	if ( isMonthlyPlan ) {
		// We want `yearlyVariantMaybeDiscountedPricePerMonth` to be the raw price the user
		// would pay if they choose an annual plan instead of the monthly one. So pro-rated
		// (or site-plan specific) credits should not be taken into account.
		const yearlyVariantMaybeDiscountedPricePerMonth =
			planYearlyVariantPricesPerMonth.discountedRawPrice ||
			planYearlyVariantPricesPerMonth.rawPrice;

		if ( yearlyVariantMaybeDiscountedPricePerMonth < planPrices.rawPrice ) {
			perMonthDescription = translate( `Save %(discountRate)s%% by paying annually`, {
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
		const maybeDiscountedPrice =
			planPrices.planDiscountedRawPrice || planPrices.discountedRawPrice || planPrices.rawPrice;
		const fullTermPriceText =
			plan?.currencyCode && maybeDiscountedPrice
				? formatCurrency( maybeDiscountedPrice, plan.currencyCode, { stripZeros: true } )
				: null;

		if ( Plans.TERM_ANNUALLY === plan?.billingTerm ) {
			perMonthDescription = translate( 'per month, %(fullTermPriceText)s billed annually', {
				args: { fullTermPriceText },
			} );
		}

		if ( Plans.TERM_BIENNIALLY === plan?.billingTerm ) {
			perMonthDescription = translate( 'per month, %(fullTermPriceText)s billed every two years', {
				args: { fullTermPriceText },
			} );
		}

		if ( Plans.TERM_TRIENNIALLY === plan?.billingTerm ) {
			perMonthDescription = translate(
				'per month, %(fullTermPriceText)s billed every three years',
				{
					args: { fullTermPriceText },
				}
			);
		}
	}

	return <div>{ perMonthDescription }</div>;
}

const PlanFeatures2023GridBillingTimeframe: FunctionComponent< Props > = ( props ) => {
	const { planName, billingTimeframe, isMonthlyPlan } = props;
	const translate = useTranslate();
	const price = formatCurrency( 25000, 'USD' );

	if ( PLAN_ENTERPRISE_GRID_WPCOM === planName ) {
		return (
			<div className="plan-features-2023-grid__vip-price">
				{ translate( 'Starts at {{b}}%(price)s{{/b}} yearly.', {
					args: { price },
					components: { b: <b /> },
					comment: 'Translators: the price is in US dollars for all users (US$25,000)',
				} ) }
			</div>
		);
	}

	return (
		<>
			{ isWpComFreePlan( planName ) ? (
				<div>{ billingTimeframe }</div>
			) : (
				<PerMonthDescription planName={ planName } isMonthlyPlan={ isMonthlyPlan } />
			) }
		</>
	);
};

export default localize( PlanFeatures2023GridBillingTimeframe );
