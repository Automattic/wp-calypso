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
import { formatCurrency } from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { SitePlanData } from 'calypso/my-sites/checkout/src/hooks/product-variants';
import { useSelector } from 'calypso/state';
import { getPlanRawPrice, getPlan } from 'calypso/state/plans/selectors';
import { WooExpressPlans } from '../ecommerce-trial/wooexpress-plans';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface WooExpressPlansPageProps {
	currentPlan: SitePlanData;
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

	const planPrices = useSelector( ( state ) => ( {
		annualPlanPrice: getPlanRawPrice( state, annualPlan.getProductId(), false ) || 0,
		annualPlanMonthlyPrice: getPlanRawPrice( state, annualPlan.getProductId(), true ) || 0,
		monthlyPlanPrice: getPlanRawPrice( state, monthlyPlan.getProductId() ) || 0,
		currencyCode: getPlan( state, annualPlan.getProductId() )?.currency_code || '',
	} ) );

	const isAnnualSubscription = ! isMonthly( currentPlan.productSlug );
	const activePlan = isAnnualSubscription ? annualPlan : monthlyPlan;
	const planInterval = isAnnualSubscription ? 'yearly' : 'monthly';

	const goToSubscriptionPage = () => {
		if ( selectedSite?.slug && currentPlan?.id ) {
			page( `/purchases/subscriptions/${ selectedSite.slug }/${ currentPlan.id }` );
		}
	};

	const monthlyPriceWrapper = <span className="woo-express-plans-page__price-card-value" />;
	const priceDescription = <span className="woo-express-plans-page__price-card-interval" />;

	const priceContent = isAnnualSubscription
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
				className={ classNames(
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
