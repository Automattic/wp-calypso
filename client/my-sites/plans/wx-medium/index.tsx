import {
	getPlans,
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
} from '@automattic/calypso-products';
import { Button, Card } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import getInTouch from 'calypso/assets/images/plans/wpcom/get-in-touch.png';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { SitePlanData } from 'calypso/my-sites/checkout/composite-checkout/hooks/product-variants';
import { getPlanRawPrice, getPlan } from 'calypso/state/plans/selectors';
import TrialFeatureCard from '../components/ecommerce-plan-features/trial-feature-card';
import { getWooExpressMediumFeatureSets } from '../ecommerce-trial/wx-medium-features';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface WXMediumPlansPageProps {
	currentPlan: SitePlanData;
	selectedSite: SiteDetails;
}

const WooExpressMediumPlansPage = ( { currentPlan, selectedSite }: WXMediumPlansPageProps ) => {
	const translate = useTranslate();

	const annualPlan = getPlans()[ PLAN_WOOEXPRESS_MEDIUM ];
	const monthlyPlan = getPlans()[ PLAN_WOOEXPRESS_MEDIUM_MONTHLY ];

	const planPrices = useSelector( ( state ) => ( {
		annualPlanPrice: getPlanRawPrice( state, annualPlan.getProductId(), false ) || 0,
		annualPlanMonthlyPrice: getPlanRawPrice( state, annualPlan.getProductId(), true ) || 0,
		monthlyPlanPrice: getPlanRawPrice( state, monthlyPlan.getProductId() ) || 0,
		currencyCode: getPlan( state, annualPlan.getProductId() )?.currency_code || '',
	} ) );

	const isAnnualSubscription = currentPlan.productSlug === PLAN_WOOEXPRESS_MEDIUM;
	const activePlan = isAnnualSubscription ? annualPlan : monthlyPlan;
	const interval = isAnnualSubscription ? 'yearly' : 'monthly';

	const wooExpressMediumPlanFeatureSets = useMemo( () => {
		return getWooExpressMediumFeatureSets( { translate, interval } );
	}, [ translate, interval ] );

	const goToSubscriptionPage = () => {
		if ( selectedSite?.slug && currentPlan?.id ) {
			page( `/purchases/subscriptions/${ selectedSite.slug }/${ currentPlan.id }` );
		}
	};

	const monthlyPriceWrapper = <span className="wx-medium-plans__price-card-value" />;
	const priceDescription = <span className="wx-medium-plans__price-card-interval" />;

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

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-woo-express-medium-plan' ] } />

			<Card className="wx-medium-plans__price-card">
				<div className="wx-medium-plans__price-card-text">
					<span className="wx-medium-plans__price-card-label">{ translate( 'My Plan' ) }</span>
					<span className="wx-medium-plans__price-card-title">{ activePlan.getTitle() }</span>
					<span className="wx-medium-plans__price-card-subtitle">
						{ translate( 'Accelerate your growth with advanced features.' ) }
					</span>
				</div>
				<div className="wx-medium-plans__price-card-conditions">{ priceContent }</div>
				<div className="wx-medium-plans__price-card-cta-wrapper">
					{ currentPlan && selectedSite && (
						<Button className="wx-medium-plans__price-card-cta" onClick={ goToSubscriptionPage }>
							{ translate( 'Manage my plan' ) }
						</Button>
					) }
				</div>
			</Card>

			<h2 className="wx-medium-plans__section-title">
				{ translate( 'What’s included in %(planName)s', {
					args: {
						planName: activePlan.getTitle(),
					},
				} ) }
			</h2>

			<div className="wx-medium-plans__features-wrapper">
				{ wooExpressMediumPlanFeatureSets.map( ( featureSet ) => (
					<TrialFeatureCard key={ featureSet.title } { ...featureSet } />
				) ) }
			</div>

			<Card className="wx-medium-plans__bottom-banner">
				<div className="wx-medium-plans__bottom-banner-content">
					<p className="wx-medium-plans__bottom-banner-title">
						{ translate( 'Want to get the most powerful tools?' ) }
					</p>
					<p className="wx-medium-plans__bottom-banner-subtitle">
						{ translate(
							'Get in touch to discuss a custom solution that meet your business needs. '
						) }
					</p>
					<Button className="wx-medium-plans__bottom-banner-cta" primary>
						{ translate( 'Get in touch' ) }
					</Button>
				</div>
				<div className="wx-medium-plans__bottom-banner-img-wrapper">
					<img
						src={ getInTouch }
						alt={ translate( 'Get in touch', { textOnly: true } ) }
						className="wx-medium-plans__bottom-banner-img"
					/>
				</div>
			</Card>
		</>
	);
};

export default WooExpressMediumPlansPage;
