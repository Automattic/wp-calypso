import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
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
import { Button, Card } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import getInTouch from 'calypso/assets/images/plans/wpcom/get-in-touch.png';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { SitePlanData } from 'calypso/my-sites/checkout/composite-checkout/hooks/product-variants';
import { WooExpressPlans } from 'calypso/my-sites/plans/ecommerce-trial/wooexpress-plans';
import { getPlanRawPrice, getPlan } from 'calypso/state/plans/selectors';
import TrialFeatureCard from '../components/ecommerce-plan-features/trial-feature-card';
import { getWooExpressMediumFeatureSets } from '../ecommerce-trial/wx-medium-features';
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

	const wooExpressMediumPlanFeatureSets = useMemo( () => {
		return getWooExpressMediumFeatureSets( { translate, interval: planInterval } );
	}, [ translate, planInterval ] );

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

	const triggerTracksEvent = useCallback( ( planSlug: string ) => {
		recordTracksEvent( 'calypso_wooexpress_plans_plan_cta_click', { plan_slug: planSlug } );
	}, [] );

	const planFeatures =
		isEnabled( 'plans/wooexpress-small' ) || isWooExpressSmallPlan( currentPlan.productSlug ) ? (
			<WooExpressPlans
				interval={ interval ? interval : planInterval }
				monthlyControlProps={ { path: plansLink( '/plans', selectedSite.slug, 'monthly', true ) } }
				siteId={ selectedSite.ID }
				siteSlug={ selectedSite.slug }
				triggerTracksEvent={ triggerTracksEvent }
				yearlyControlProps={ { path: plansLink( '/plans', selectedSite.slug, 'yearly', true ) } }
				showIntervalToggle={ showIntervalToggle }
			/>
		) : (
			<>
				<h2 className="woo-express-plans-page__section-title">
					{ translate( 'What’s included in %(planName)s plan', {
						args: {
							planName: activePlan.getTitle(),
						},
					} ) }
				</h2>

				<div className="woo-express-plans-page__features-wrapper">
					{ wooExpressMediumPlanFeatureSets.map( ( featureSet ) => (
						<TrialFeatureCard key={ featureSet.title } { ...featureSet } />
					) ) }
				</div>

				<Card className="woo-express-plans-page__bottom-banner">
					<div className="woo-express-plans-page__bottom-banner-content">
						<p className="woo-express-plans-page__bottom-banner-title">
							{ translate( 'Want to get the most powerful tools?' ) }
						</p>
						<p className="woo-express-plans-page__bottom-banner-subtitle">
							{ translate(
								'Get in touch to discuss a custom solution that meet your business needs. '
							) }
						</p>
						<Button className="woo-express-plans-page__bottom-banner-cta" primary>
							{ translate( 'Get in touch' ) }
						</Button>
					</div>
					<div className="woo-express-plans-page__bottom-banner-img-wrapper">
						<img
							src={ getInTouch }
							alt={ translate( 'Get in touch', { textOnly: true } ) }
							className="woo-express-plans-page__bottom-banner-img"
						/>
					</div>
				</Card>
			</>
		);

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-woo-express-plan' ] } />

			<Card
				className={ classNames( 'woo-express-plans-page__price-card', {
					'woo-express-plans-page__price-card-for-grid': isEnabled( 'plans/wooexpress-small' ),
				} ) }
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
					{ currentPlan && selectedSite && ! isEnabled( 'plans/wooexpress-small' ) && (
						<Button
							className="woo-express-plans-page__price-card-cta"
							onClick={ goToSubscriptionPage }
						>
							{ translate( 'Manage my plan' ) }
						</Button>
					) }
				</div>
			</Card>

			{ planFeatures }
		</>
	);
};

export default WooExpressPlansPage;
