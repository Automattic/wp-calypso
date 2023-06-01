import {
	PLAN_FREE,
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
	PLAN_WOOEXPRESS_PLUS,
	PLAN_WOOEXPRESS_SMALL,
	PLAN_WOOEXPRESS_SMALL_MONTHLY,
	getPlanPath,
	getPlans,
	isWooExpressPlan,
} from '@automattic/calypso-products';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { hasTranslation } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useMemo } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { getECommerceTrialCheckoutUrl } from 'calypso/lib/ecommerce-trial/get-ecommerce-trial-checkout-url';
import PlanIntervalSelector from 'calypso/my-sites/plans-features-main/components/plan-interval-selector';
import { useSelector } from 'calypso/state';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

import './style.scss';

type SegmentedOptionProps = {
	path?: string;
	onClick?: () => void;
};
interface WooExpressPlansProps {
	siteId: number | string;
	siteSlug: string;
	interval?: 'monthly' | 'yearly';
	monthlyControlProps: SegmentedOptionProps;
	triggerTracksEvent?: ( planSlug: string ) => void;
	yearlyControlProps: SegmentedOptionProps;
	showIntervalToggle?: boolean;
}

export function WooExpressPlans( props: WooExpressPlansProps ) {
	const {
		interval,
		monthlyControlProps,
		showIntervalToggle,
		siteId,
		siteSlug,
		triggerTracksEvent,
		yearlyControlProps,
	} = props;
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();

	const mediumPlanAnnual = getPlans()[ PLAN_WOOEXPRESS_MEDIUM ];
	const mediumPlanMonthly = getPlans()[ PLAN_WOOEXPRESS_MEDIUM_MONTHLY ];
	const mediumPlanPrices = useSelector( ( state ) => ( {
		annualPlanMonthlyPrice: getPlanRawPrice( state, mediumPlanAnnual.getProductId(), true ) || 0,
		monthlyPlanPrice: getPlanRawPrice( state, mediumPlanMonthly.getProductId() ) || 0,
	} ) );

	const percentageSavings = Math.floor(
		( 1 - mediumPlanPrices.annualPlanMonthlyPrice / mediumPlanPrices.monthlyPlanPrice ) * 100
	);

	const planIntervals = useMemo( () => {
		return [
			{
				interval: 'monthly',
				...monthlyControlProps,
				content: <span>{ translate( 'Pay Monthly' ) }</span>,
				selected: interval === 'monthly',
			},
			{
				interval: 'yearly',
				...yearlyControlProps,
				content: (
					<span>
						{ isEnglishLocale ||
						hasTranslation( 'Pay Annually {{span}}(Save %(percentageSavings)s%%){{/span}}' )
							? translate( 'Pay Annually {{span}}(Save %(percentageSavings)s%%){{/span}}', {
									args: { percentageSavings },
									components: { span: <span className="wooexpress-plans__interval-savings" /> },
							  } )
							: translate( 'Pay Annually (Save %(percentageSavings)s%%)', {
									args: { percentageSavings },
							  } ) }
					</span>
				),
				selected: interval === 'yearly',
			},
		];
	}, [
		interval,
		translate,
		monthlyControlProps,
		percentageSavings,
		yearlyControlProps,
		isEnglishLocale,
	] );

	const smallPlan = interval === 'yearly' ? PLAN_WOOEXPRESS_SMALL : PLAN_WOOEXPRESS_SMALL_MONTHLY;
	const mediumPlan =
		interval === 'yearly' ? PLAN_WOOEXPRESS_MEDIUM : PLAN_WOOEXPRESS_MEDIUM_MONTHLY;

	const onUpgradeClick = useCallback(
		( cartItem: MinimalRequestCartProduct | null ) => {
			const upgradePlanSlug = cartItem?.product_slug ?? PLAN_FREE;

			triggerTracksEvent?.( upgradePlanSlug );

			const planPath = getPlanPath( upgradePlanSlug ) ?? '';

			const checkoutUrl = isWooExpressPlan( upgradePlanSlug )
				? getECommerceTrialCheckoutUrl( { productSlug: planPath, siteSlug } )
				: `/checkout/${ siteSlug }/${ planPath }`;

			page( checkoutUrl );
		},
		[ siteSlug, triggerTracksEvent ]
	);

	const plansTableProps = {
		// TODO clk
		plans: [ smallPlan, mediumPlan, PLAN_WOOEXPRESS_PLUS ],
		hidePlansFeatureComparison: false,
		hideUnavailableFeatures: true,
		siteId,
		onUpgradeClick,
	};

	return (
		<>
			{ showIntervalToggle && (
				<div className="wooexpress-plans__interval-toggle-wrapper">
					<PlanIntervalSelector
						className="wooexpress-plans__interval-toggle price-toggle"
						intervals={ planIntervals }
						isPlansInsideStepper={ false }
						use2023PricingGridStyles={ true }
					/>
				</div>
			) }
			<div className="wooexpress-plans__grid is-2023-pricing-grid">
				<AsyncLoad require="calypso/my-sites/plan-features-2023-grid" { ...plansTableProps } />
			</div>
		</>
	);
}
