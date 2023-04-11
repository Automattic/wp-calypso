import { isEnabled } from '@automattic/calypso-config';
import {
	getPlans,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
} from '@automattic/calypso-products';
import { Button, Card } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getECommerceTrialCheckoutUrl } from 'calypso/lib/ecommerce-trial/get-ecommerce-trial-checkout-url';
import PlanIntervalSelector from 'calypso/my-sites/plans-features-main/plan-interval-selector';
import { getPlanRawPrice, getPlan } from 'calypso/state/plans/selectors';
import TrialFeatureCard from './trial-feature-card';
import type { WooExpressMediumPlanFeatureSet } from './trial-feature-card';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

type SegmentedOptionProps = {
	path?: string;
	onClick?: () => void;
};

interface ECommercePlanFeaturesProps {
	interval: 'monthly' | 'yearly';
	monthlyControlProps: SegmentedOptionProps;
	planFeatureSets: WooExpressMediumPlanFeatureSet[];
	priceCardSubtitle?: TranslateResult;
	siteSlug?: string | null;
	triggerTracksEvent: ( tracksLocation: string ) => void;
	yearlyControlProps: SegmentedOptionProps;
}

const ECommercePlanFeatures = ( {
	interval,
	monthlyControlProps,
	planFeatureSets,
	priceCardSubtitle,
	siteSlug,
	triggerTracksEvent,
	yearlyControlProps,
}: ECommercePlanFeaturesProps ) => {
	const translate = useTranslate();

	const targetPlanAnnual = isEnabled( 'plans/wooexpress-medium' )
		? getPlans()[ PLAN_WOOEXPRESS_MEDIUM ]
		: getPlans()[ PLAN_ECOMMERCE ];
	const targetPlanMonthly = isEnabled( 'plans/wooexpress-medium' )
		? getPlans()[ PLAN_WOOEXPRESS_MEDIUM_MONTHLY ]
		: getPlans()[ PLAN_ECOMMERCE_MONTHLY ];

	const targetPlanPrices = useSelector( ( state ) => ( {
		annualPlanPrice: getPlanRawPrice( state, targetPlanAnnual.getProductId(), false ) || 0,
		annualPlanMonthlyPrice: getPlanRawPrice( state, targetPlanAnnual.getProductId(), true ) || 0,
		monthlyPlanPrice: getPlanRawPrice( state, targetPlanMonthly.getProductId() ) || 0,
		currencyCode: getPlan( state, targetPlanAnnual.getProductId() )?.currency_code || '',
	} ) );

	const isAnnualSubscription = interval === 'yearly';
	const targetPlan = isAnnualSubscription ? targetPlanAnnual : targetPlanMonthly;

	const percentageSavings = Math.floor(
		( 1 - targetPlanPrices.annualPlanMonthlyPrice / targetPlanPrices.monthlyPlanPrice ) * 100
	);

	const monthlyPriceWrapper = <span className="ecommerce-plan-features__price-card-value" />;
	const priceDescription = <span className="ecommerce-plan-features__price-card-interval" />;

	const priceContent = isAnnualSubscription
		? translate(
				'{{monthlyPriceWrapper}}%(monthlyPrice)s{{/monthlyPriceWrapper}} {{priceDescription}}per month, %(annualPrice)s billed annually{{/priceDescription}}',
				{
					args: {
						monthlyPrice: formatCurrency(
							targetPlanPrices.annualPlanMonthlyPrice,
							targetPlanPrices.currencyCode,
							{ stripZeros: true }
						),
						annualPrice: formatCurrency(
							targetPlanPrices.annualPlanPrice,
							targetPlanPrices.currencyCode,
							{ stripZeros: true }
						),
					},
					components: {
						monthlyPriceWrapper,
						priceDescription,
					},
				}
		  )
		: translate(
				'{{monthlyPriceWrapper}}%(monthlyPrice)s{{/monthlyPriceWrapper}} {{priceDescription}}per month{{/priceDescription}}',
				{
					args: {
						monthlyPrice: formatCurrency(
							targetPlanPrices.monthlyPlanPrice,
							targetPlanPrices.currencyCode,
							{ stripZeros: true }
						),
					},
					components: {
						monthlyPriceWrapper,
						priceDescription,
					},
				}
		  );

	const redirectToCheckoutForPlan = useCallback(
		( tracksLocation: string ) => {
			triggerTracksEvent( tracksLocation );

			if ( ! siteSlug ) {
				return;
			}

			const checkoutUrl = getECommerceTrialCheckoutUrl( {
				productSlug: targetPlan.getStoreSlug(),
				siteSlug,
			} );

			page.redirect( checkoutUrl );
		},
		[ siteSlug, targetPlan, triggerTracksEvent ]
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
	}, [ interval, monthlyControlProps, percentageSavings, translate, yearlyControlProps ] );

	return (
		<div className="ecommerce-plan-features">
			<div className="ecommerce-plan-features__interval-toggle-wrapper">
				<PlanIntervalSelector
					className="ecommerce-plan-features__interval-toggle price-toggle"
					intervals={ planIntervals }
					isPlansInsideStepper={ false }
					use2023PricingGridStyles={ true }
				/>
			</div>

			<Card className="ecommerce-plan-features__price-card">
				<div className="ecommerce-plan-features__price-card-text">
					<span className="ecommerce-plan-features__price-card-title">
						{ targetPlan.getTitle() }
					</span>
					<span className="ecommerce-plan-features__price-card-subtitle">
						{ priceCardSubtitle
							? priceCardSubtitle
							: translate( 'Accelerate your growth with advanced features.' ) }
					</span>
				</div>
				<div className="ecommerce-plan-features__price-card-conditions">
					{ priceContent }
					{ isAnnualSubscription && (
						<span className="ecommerce-plan-features__price-card-savings">
							{ translate( 'Save %(percentageSavings)s%% by paying annually', {
								args: { percentageSavings },
							} ) }
						</span>
					) }
				</div>
				<div className="ecommerce-plan-features__price-card-cta-wrapper">
					<Button
						className="ecommerce-plan-features__price-card-cta"
						primary
						disabled={ ! siteSlug }
						onClick={ () => redirectToCheckoutForPlan( 'main-price-card' ) }
					>
						{ translate( 'Upgrade now' ) }
					</Button>
				</div>
			</Card>

			<div className="ecommerce-plan-features__features-wrapper">
				{ planFeatureSets.map( ( featureSet ) => (
					<TrialFeatureCard key={ featureSet.title } { ...featureSet } />
				) ) }
			</div>
			<div className="ecommerce-plan-features__cta-wrapper">
				<Button
					className="ecommerce-plan-features__cta is-primary"
					disabled={ ! siteSlug }
					onClick={ () => redirectToCheckoutForPlan( 'footer' ) }
				>
					{ translate( 'Upgrade now' ) }
				</Button>
			</div>
		</div>
	);
};

export default ECommercePlanFeatures;
