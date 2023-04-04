import {
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
	PLAN_WOOEXPRESS_SMALL,
	PLAN_WOOEXPRESS_SMALL_MONTHLY,
	getPlans,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import PlanIntervalSelector from 'calypso/my-sites/plans-features-main/plan-interval-selector';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';

import './style.scss';

type SegmentedOptionProps = {
	path?: string;
	onClick?: () => void;
};
interface WooExpressPlansProps {
	siteId: number | string;
	interval?: 'monthly' | 'yearly';
	monthlyControlProps: SegmentedOptionProps;
	yearlyControlProps: SegmentedOptionProps;
	showIntervalToggle: boolean;
}

export function WooExpressPlans( props: WooExpressPlansProps ) {
	const { siteId, interval, monthlyControlProps, yearlyControlProps, showIntervalToggle } = props;
	const translate = useTranslate();

	const mediumPlanAnnual = getPlans()[ PLAN_WOOEXPRESS_MEDIUM ];
	const mediumPlanMonthly = getPlans()[ PLAN_WOOEXPRESS_MEDIUM_MONTHLY ];
	const mediumPlanPrices = useSelector( ( state ) => ( {
		annualPlanMonthlyPrice: getPlanRawPrice( state, mediumPlanAnnual.getProductId(), true ) || 0,
		monthlyPlanPrice: getPlanRawPrice( state, mediumPlanMonthly.getProductId() ) || 0,
	} ) );

	const percentageSavings = Math.round(
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
						{ translate( 'Pay Annually (Save %(percentageSavings)s%%)', {
							args: { percentageSavings },
						} ) }
					</span>
				),
				selected: interval === 'yearly',
			},
		];
	}, [ interval, translate, monthlyControlProps, percentageSavings, yearlyControlProps ] );

	const smallPlan = interval === 'yearly' ? PLAN_WOOEXPRESS_SMALL : PLAN_WOOEXPRESS_SMALL_MONTHLY;
	const mediumPlan =
		interval === 'yearly' ? PLAN_WOOEXPRESS_MEDIUM : PLAN_WOOEXPRESS_MEDIUM_MONTHLY;

	const plansTableProps = {
		plans: [ smallPlan, mediumPlan ],
		hidePlansFeatureComparison: true,
		siteId,
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
