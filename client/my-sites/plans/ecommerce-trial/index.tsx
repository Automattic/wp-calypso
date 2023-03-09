import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	getPlans,
	plansLink,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM,
} from '@automattic/calypso-products';
import { Button, Card } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import SegmentedControl from 'calypso/components/segmented-control';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getECommerceTrialCheckoutUrl } from 'calypso/lib/ecommerce-trial/get-ecommerce-trial-checkout-url';
import { getPlanRawPrice, getPlan } from 'calypso/state/plans/selectors';
import { getECommerceFeatureSets } from './ecommerce-features';
import ECommerceTrialBanner from './ecommerce-trial-banner';
import TrialFeatureCard from './trial-feature-card';

import './style.scss';

interface ECommerceTrialPlansPageProps {
	interval?: 'monthly' | 'yearly';
	siteSlug: string;
}

interface PlanPrices {
	annualPlanPrice: number;
	annualPlanMonthlyPrice: number;
	monthlyPlanPrice: number;
	currencyCode: string;
}

const ECommerceTrialPlansPage = ( props: ECommerceTrialPlansPageProps ) => {
	const interval = props.interval ?? 'monthly';
	const siteSlug = props.siteSlug;

	const translate = useTranslate();

	const eCommercePlanAnnual = getPlans()[ PLAN_ECOMMERCE ];
	const eCommercePlanMonthly = getPlans()[ PLAN_ECOMMERCE_MONTHLY ];
	const wooexpressMediumMonthly = getPlans()[ PLAN_WOOEXPRESS_MEDIUM_MONTHLY ];
	const wooexpressMediumYearly = getPlans()[ PLAN_WOOEXPRESS_MEDIUM ];

	const eCommercePlanPrices = useSelector( ( state ) => ( {
		annualPlanPrice: getPlanRawPrice( state, eCommercePlanAnnual.getProductId(), false ) || 0,
		annualPlanMonthlyPrice: getPlanRawPrice( state, eCommercePlanAnnual.getProductId(), true ) || 0,
		monthlyPlanPrice: getPlanRawPrice( state, eCommercePlanMonthly.getProductId() ) || 0,
		currencyCode: getPlan( state, eCommercePlanAnnual.getProductId() )?.currency_code || '',
	} ) );

	const wooexpressPlanPrices = useSelector( ( state ) => ( {
		monthlyPlanPrice: getPlanRawPrice( state, wooexpressMediumMonthly.getProductId() ) || 0,
		annualPlanPrice: getPlanRawPrice( state, wooexpressMediumYearly.getProductId() ) || 0,
		annualPlanMonthlyPrice:
			getPlanRawPrice( state, wooexpressMediumYearly.getProductId(), true ) || 0,
		currencyCode: getPlan( state, wooexpressMediumMonthly.getProductId() )?.currency_code || '',
	} ) );

	const isAnnualSubscription = interval === 'yearly';
	const targetECommercePlan = isAnnualSubscription ? eCommercePlanAnnual : eCommercePlanMonthly;
	const targetWooExpressMediumPlan = isAnnualSubscription
		? wooexpressMediumYearly
		: wooexpressMediumMonthly;

	const percentageSavings = Math.floor(
		( 1 - eCommercePlanPrices.annualPlanMonthlyPrice / eCommercePlanPrices.monthlyPlanPrice ) * 100
	);

	const redirectToCheckoutForPlan = useCallback(
		( tracksLocation: string ) => {
			recordTracksEvent( 'calypso_wooexpress_plans_page_upgrade_cta_clicked', {
				location: tracksLocation,
			} );

			const productSlug = config.isEnabled( 'plans/wooexpress-medium' )
				? targetWooExpressMediumPlan.getStoreSlug()
				: targetECommercePlan.getStoreSlug();

			const checkoutUrl = getECommerceTrialCheckoutUrl( {
				productSlug,
				siteSlug,
			} );

			page.redirect( checkoutUrl );
		},
		[ siteSlug, targetECommercePlan, targetWooExpressMediumPlan ]
	);

	const eCommercePlanFeatureSets = useMemo( () => {
		return getECommerceFeatureSets( { translate } );
	}, [ translate ] );

	const monthlyPriceWrapper = <span className="e-commerce-trial-plans__price-card-value" />;
	const priceDescription = <span className="e-commerce-trial-plans__price-card-interval" />;

	const getPriceContent = ( planPrices: PlanPrices ) => {
		return isAnnualSubscription
			? translate(
					'{{monthlyPriceWrapper}}%(monthlyPrice)s{{/monthlyPriceWrapper}} {{priceDescription}}per month, %(annualPrice)s billed annually{{/priceDescription}}',
					{
						args: {
							monthlyPrice: formatCurrency(
								planPrices.annualPlanMonthlyPrice,
								planPrices.currencyCode,
								{ stripZeros: true }
							),
							annualPrice: formatCurrency( planPrices.annualPlanPrice, planPrices.currencyCode, {
								stripZeros: true,
							} ),
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
							monthlyPrice: formatCurrency( planPrices.monthlyPlanPrice, planPrices.currencyCode, {
								stripZeros: true,
							} ),
						},
						components: {
							monthlyPriceWrapper,
							priceDescription,
						},
					}
			  );
	};

	const priceContent = config.isEnabled( 'plans/wooexpress-medium' )
		? getPriceContent( wooexpressPlanPrices )
		: getPriceContent( eCommercePlanPrices );

	const eCommercePlanUpgradeCard = () => {
		return (
			<Card className="e-commerce-trial-plans__price-card">
				<div className="e-commerce-trial-plans__price-card-text">
					<span className="e-commerce-trial-plans__price-card-title">
						{ targetECommercePlan.getTitle() }
					</span>
					<span className="e-commerce-trial-plans__price-card-subtitle">
						{ translate( 'Accelerate your growth with advanced features.' ) }
					</span>
				</div>
				<div className="e-commerce-trial-plans__price-card-conditions">
					{ priceContent }
					{ isAnnualSubscription && (
						<span className="e-commerce-trial-plans__price-card-savings">
							{ translate( 'Save %(percentageSavings)s%% by paying annually', {
								args: { percentageSavings },
							} ) }
						</span>
					) }
				</div>
				<div className="e-commerce-trial-plans__price-card-cta-wrapper">
					<Button
						className="e-commerce-trial-plans__price-card-cta"
						primary
						onClick={ () => redirectToCheckoutForPlan( 'main-price-card' ) }
					>
						{ translate( 'Upgrade now' ) }
					</Button>
				</div>
			</Card>
		);
	};

	const wooexpressMediumMonthlyPlanUpgradeCard = () => {
		return (
			<Card className="e-commerce-trial-plans__price-card">
				<div className="e-commerce-trial-plans__price-card-text">
					<span className="e-commerce-trial-plans__price-card-title">
						{ targetWooExpressMediumPlan.getTitle() }
					</span>
					<span className="e-commerce-trial-plans__price-card-subtitle">
						{ /* TODO - Is this the right copy? */ }
						{ translate( 'Accelerate your growth with advanced features.' ) }
					</span>
				</div>
				<div className="e-commerce-trial-plans__price-card-conditions">{ priceContent }</div>
				<div className="e-commerce-trial-plans__price-card-cta-wrapper">
					<Button
						className="e-commerce-trial-plans__price-card-cta"
						primary
						onClick={ () => redirectToCheckoutForPlan( 'main-price-card' ) }
					>
						{ translate( 'Upgrade now' ) }
					</Button>
				</div>
			</Card>
		);
	};

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-ecommerce-trial-plan' ] } />

			<div className="e-commerce-trial-plans__banner-wrapper">
				<ECommerceTrialBanner />
			</div>

			<div className="e-commerce-trial-plans__interval-toggle-wrapper">
				<SegmentedControl
					compact
					primary={ true }
					className="e-commerce-trial-plans__interval-toggle price-toggle"
				>
					<SegmentedControl.Item
						selected={ interval === 'monthly' }
						path={ plansLink( '/plans', siteSlug, 'monthly', true ) }
					>
						<span>{ translate( 'Pay Monthly' ) }</span>
					</SegmentedControl.Item>

					<SegmentedControl.Item
						selected={ interval === 'yearly' }
						path={ plansLink( '/plans', siteSlug, 'yearly', true ) }
					>
						<span>
							{ translate( 'Pay Annually (Save %(percentageSavings)s%%)', {
								args: { percentageSavings },
							} ) }
						</span>
					</SegmentedControl.Item>
				</SegmentedControl>
			</div>

			{ config.isEnabled( 'plans/wooexpress-medium' )
				? wooexpressMediumMonthlyPlanUpgradeCard()
				: eCommercePlanUpgradeCard() }

			<div className="e-commerce-trial-plans__features-wrapper">
				{ eCommercePlanFeatureSets.map( ( featureSet ) => (
					<TrialFeatureCard key={ featureSet.title } { ...featureSet } />
				) ) }
			</div>
			<div className="e-commerce-trial-plans__cta-wrapper">
				<Button
					className="e-commerce-trial-plans__cta is-primary"
					onClick={ () => redirectToCheckoutForPlan( 'footer' ) }
				>
					{ translate( 'Upgrade now' ) }
				</Button>
			</div>
		</>
	);
};

export default ECommerceTrialPlansPage;
