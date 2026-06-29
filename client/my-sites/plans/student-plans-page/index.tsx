import { getPlan, PLAN_STUDENT } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Card } from '@automattic/components';
import { Plans, type SiteDetails, type SitePlan } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';

import './style.scss';

interface StudentPlansPageProps {
	currentPlan: SitePlan;
	selectedSite: SiteDetails;
}

const StudentPlansPage = ( { currentPlan, selectedSite }: StudentPlansPageProps ) => {
	const translate = useTranslate();
	const studentPlan = getPlan( PLAN_STUDENT );

	const pricingMeta = Plans.usePricingMetaForGridPlans( {
		planSlugs: [ PLAN_STUDENT ],
		siteId: null,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
	} );

	// Using `discountedPrice` below will give us the price with any currency/conversion discounts applied.
	const annualPlanPrice =
		pricingMeta?.[ PLAN_STUDENT ]?.discountedPrice?.full ??
		pricingMeta?.[ PLAN_STUDENT ]?.originalPrice?.full ??
		0;
	const annualPlanMonthlyPrice =
		pricingMeta?.[ PLAN_STUDENT ]?.discountedPrice?.monthly ??
		pricingMeta?.[ PLAN_STUDENT ]?.originalPrice?.monthly ??
		0;
	const currencyCode = pricingMeta?.[ PLAN_STUDENT ]?.currencyCode ?? '';

	const goToSubscriptionPage = () => {
		if ( selectedSite?.slug && currentPlan?.purchaseId ) {
			page( `/purchases/subscriptions/${ selectedSite.slug }/${ currentPlan.purchaseId }` );
		}
	};

	const monthlyPriceWrapper = <span className="student-plans-page__price-card-value" />;
	const priceDescription = <span className="student-plans-page__price-card-interval" />;

	const priceContent = translate(
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
	);

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-student-plan' ] } />
			<Card className="student-plans-page__price-card">
				<div className="student-plans-page__price-card-text">
					<span className="student-plans-page__price-card-label">{ translate( 'My Plan' ) }</span>
					<span className="student-plans-page__price-card-title">{ studentPlan?.getTitle() }</span>
					<span className="student-plans-page__price-card-subtitle">
						{ studentPlan?.getPlanTagline?.() }
					</span>
				</div>
				<div className="student-plans-page__price-card-conditions">{ priceContent }</div>
				<div className="student-plans-page__price-card-cta-wrapper">
					{ currentPlan && selectedSite && (
						<Button className="student-plans-page__price-card-cta" onClick={ goToSubscriptionPage }>
							{ translate( 'Manage my plan' ) }
						</Button>
					) }
				</div>
			</Card>
			<div className="student-plans-page__grid is-2023-pricing-grid">
				<PlansFeaturesMain
					siteId={ selectedSite.ID }
					intervalType="yearly"
					intent="plans-student"
					hidePlanTypeSelector
					hideUnavailableFeatures
					hidePlansFeatureComparison
				/>
			</div>
		</>
	);
};

export default StudentPlansPage;
