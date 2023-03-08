import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	getPlans,
	plansLink,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_MONTHLY,
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

const ECommerceTrialPlansPage = ( props: ECommerceTrialPlansPageProps ) => {
	const interval = props.interval ?? 'monthly';
	const siteSlug = props.siteSlug;

	const translate = useTranslate();

	const eCommercePlanAnnual = getPlans()[ PLAN_ECOMMERCE ];
	const eCommercePlanMonthly = getPlans()[ PLAN_ECOMMERCE_MONTHLY ];

	const eCommercePlanPrices = useSelector( ( state ) => ( {
		annualPlanPrice: getPlanRawPrice( state, eCommercePlanAnnual.getProductId(), false ) || 0,
		annualPlanMonthlyPrice: getPlanRawPrice( state, eCommercePlanAnnual.getProductId(), true ) || 0,
		monthlyPlanPrice: getPlanRawPrice( state, eCommercePlanMonthly.getProductId() ) || 0,
		currencyCode: getPlan( state, eCommercePlanAnnual.getProductId() )?.currency_code || '',
	} ) );

	const isAnnualSubscription = interval === 'yearly';
	const targetECommercePlan = isAnnualSubscription ? eCommercePlanAnnual : eCommercePlanMonthly;

	const percentageSavings = Math.floor(
		( 1 - eCommercePlanPrices.annualPlanMonthlyPrice / eCommercePlanPrices.monthlyPlanPrice ) * 100
	);

	const redirectToCheckoutForPlan = useCallback(
		( tracksLocation: string ) => {
			recordTracksEvent( 'calypso_wooexpress_plans_page_upgrade_cta_clicked', {
				location: tracksLocation,
			} );

			const checkoutUrl = getECommerceTrialCheckoutUrl( {
				productSlug: targetECommercePlan.getStoreSlug(),
				siteSlug,
			} );

			page.redirect( checkoutUrl );
		},
		[ siteSlug, targetECommercePlan ]
	);

	const eCommercePlanFeatureSets = useMemo( () => {
		return getECommerceFeatureSets( { translate } );
	}, [ translate ] );

	const monthlyPriceWrapper = <span className="e-commerce-trial-plans__price-card-value" />;
	const priceDescription = <span className="e-commerce-trial-plans__price-card-interval" />;

	const priceContent = isAnnualSubscription
		? translate(
				'{{monthlyPriceWrapper}}%(monthlyPrice)s{{/monthlyPriceWrapper}} {{priceDescription}}per month, %(annualPrice)s billed annually{{/priceDescription}}',
				{
					args: {
						monthlyPrice: formatCurrency(
							eCommercePlanPrices.annualPlanMonthlyPrice,
							eCommercePlanPrices.currencyCode,
							{ stripZeros: true }
						),
						annualPrice: formatCurrency(
							eCommercePlanPrices.annualPlanPrice,
							eCommercePlanPrices.currencyCode,
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
							eCommercePlanPrices.monthlyPlanPrice,
							eCommercePlanPrices.currencyCode,
							{ stripZeros: true }
						),
					},
					components: {
						monthlyPriceWrapper,
						priceDescription,
					},
				}
		  );

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
