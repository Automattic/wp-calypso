import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	getPlans,
	plansLink,
	isMonthly,
	isWooExpressSmallPlan,
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
	PLAN_WOOEXPRESS_SMALL,
	PLAN_WOOEXPRESS_SMALL_MONTHLY,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Card } from '@automattic/components';
import { Plans, type SiteDetails, SitePlan } from '@automattic/data-stores';
import clsx from 'clsx';
import { formatCurrency, useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { WooExpressPlans } from '../ecommerce-trial/wooexpress-plans';

import './style.scss';

interface WooExpressPlansPageProps {
	currentPlan: SitePlan;
	interval?: 'monthly' | 'yearly';
	selectedSite: SiteDetails;
	showIntervalToggle: boolean;
}

const WooExpressPlansPage = ( {
	currentPlan,
	interval,
	selectedSite,
	showIntervalToggle,
}: WooExpressPlansPageProps ) => {
	const translate = useTranslate();
	const annualPlanSlug = isWooExpressSmallPlan( currentPlan.productSlug )
		? PLAN_WOOEXPRESS_SMALL
		: PLAN_WOOEXPRESS_MEDIUM;
	const monthlyPlanSlug = isWooExpressSmallPlan( currentPlan.productSlug )
		? PLAN_WOOEXPRESS_SMALL_MONTHLY
		: PLAN_WOOEXPRESS_MEDIUM_MONTHLY;
	const annualPlan = getPlans()[ annualPlanSlug ];
	const monthlyPlan = getPlans()[ monthlyPlanSlug ];

	const pricingMeta = Plans.usePricingMetaForGridPlans( {
		planSlugs: [ annualPlanSlug, monthlyPlanSlug ],
		siteId: null,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
	} );

	// Using `discountedPrice` below will give us the price with any currency/conversion discounts applied.
	const annualPlanPrice =
		pricingMeta?.[ annualPlanSlug ]?.discountedPrice?.full ??
		pricingMeta?.[ annualPlanSlug ]?.originalPrice?.full ??
		0;
	const annualPlanMonthlyPrice =
		pricingMeta?.[ annualPlanSlug ]?.discountedPrice?.monthly ??
		pricingMeta?.[ annualPlanSlug ]?.originalPrice?.monthly ??
		0;
	const monthlyPlanPrice =
		pricingMeta?.[ monthlyPlanSlug ]?.discountedPrice?.full ??
		pricingMeta?.[ monthlyPlanSlug ]?.originalPrice?.full ??
		0;
	const currencyCode = pricingMeta?.[ annualPlanSlug ]?.currencyCode ?? '';

	const isAnnualSubscription = ! isMonthly( currentPlan.productSlug );
	const activePlan = isAnnualSubscription ? annualPlan : monthlyPlan;
	const planInterval = isAnnualSubscription ? 'yearly' : 'monthly';

	const goToSubscriptionPage = () => {
		if ( selectedSite?.slug && currentPlan?.purchaseId ) {
			page( `/purchases/subscriptions/${ selectedSite.slug }/${ currentPlan.purchaseId }` );
		}
	};

	const monthlyPriceWrapper = <span className="woo-express-plans-page__price-card-value" />;
	const priceDescription = <span className="woo-express-plans-page__price-card-interval" />;

	const priceContent = isAnnualSubscription
		? translate(
				'{{monthlyPriceWrapper}}%(monthlyPrice)s{{/monthlyPriceWrapper}} {{priceDescription}}per month, %(annualPrice)s billed annually{{/priceDescription}}',
				{
					args: {
						monthlyPrice: formatCurrency( annualPlanMonthlyPrice, currencyCode, {
							stripZeros: true,
							isSmallestUnit: true,
						} ),
						annualPrice: formatCurrency( annualPlanPrice, currencyCode, {
							stripZeros: true,
							isSmallestUnit: true,
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
						monthlyPrice: formatCurrency( monthlyPlanPrice, currencyCode, {
							stripZeros: true,
							isSmallestUnit: true,
						} ),
					},
					components: {
						monthlyPriceWrapper,
						priceDescription,
					},
				}
		  );

	const triggerPlansGridTracksEvent = useCallback( ( planSlug: string ) => {
		recordTracksEvent( 'calypso_wooexpress_plans_page_upgrade_cta_clicked', {
			location: 'plans_grid',
			plan_slug: planSlug,
		} );
	}, [] );

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-woo-express-plan' ] } />
			<Card
				className={ clsx(
					'woo-express-plans-page__price-card',
					'woo-express-plans-page__price-card-for-grid'
				) }
			>
				<div className="woo-express-plans-page__price-card-text">
					<span className="woo-express-plans-page__price-card-label">
						{ translate( 'My Plan' ) }
					</span>
					<span className="woo-express-plans-page__price-card-title">
						{ activePlan.getTitle() }
					</span>
					<span className="woo-express-plans-page__price-card-subtitle">
						{ translate( 'Accelerate your growth with advanced features.' ) }
					</span>
				</div>
				<div className="woo-express-plans-page__price-card-conditions">{ priceContent }</div>
				<div className="woo-express-plans-page__price-card-cta-wrapper">
					{ currentPlan && selectedSite && (
						<Button
							className="woo-express-plans-page__price-card-cta"
							onClick={ goToSubscriptionPage }
						>
							{ translate( 'Manage my plan' ) }
						</Button>
					) }
				</div>
			</Card>
			<WooExpressPlans
				interval={ interval ? interval : planInterval }
				monthlyControlProps={ { path: plansLink( '/plans', selectedSite.slug, 'monthly', true ) } }
				siteId={ selectedSite.ID }
				siteSlug={ selectedSite.slug }
				triggerTracksEvent={ triggerPlansGridTracksEvent }
				yearlyControlProps={ { path: plansLink( '/plans', selectedSite.slug, 'yearly', true ) } }
				showIntervalToggle={ showIntervalToggle }
			/>
		</>
	);
};

export default WooExpressPlansPage;
