import { applyTestFiltersToPlansList, PLAN_STUDENT } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Card } from '@automattic/components';
import { type SiteDetails, type SitePlan } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';

import './style.scss';

// Students can only upgrade to yearly terms; the student plan itself is annual-only.
const UPGRADE_INTERVALS = [ 'yearly', '2yearly', '3yearly' ] as const;
type UpgradeInterval = ( typeof UPGRADE_INTERVALS )[ number ];
const DISPLAYED_INTERVALS: UpgradeInterval[] = [ ...UPGRADE_INTERVALS ];
const BODY_CLASS = [ 'is-student-plan' ];

interface StudentPlansPageProps {
	currentPlan: SitePlan;
	selectedSite: SiteDetails;
	intervalType?: string;
	isOwner?: boolean;
	coupon?: string;
	redirectTo?: string;
	pluginSlug?: string;
	discountEndDate?: Date;
}

const StudentPlansPage = ( {
	currentPlan,
	selectedSite,
	intervalType,
	isOwner,
	coupon,
	redirectTo,
	pluginSlug,
	discountEndDate,
}: StudentPlansPageProps ) => {
	const translate = useTranslate();
	const studentPlan = applyTestFiltersToPlansList( PLAN_STUDENT, undefined );

	const selectedInterval = UPGRADE_INTERVALS.includes( intervalType as UpgradeInterval )
		? ( intervalType as UpgradeInterval )
		: 'yearly';

	// The current plan's pricing comes from the site's plans (it is not a publicly-priced catalog plan).
	const pricing = currentPlan?.pricing;
	const annualPlanPrice = pricing?.discountedPrice?.full ?? pricing?.originalPrice?.full ?? null;
	const annualPlanMonthlyPrice =
		pricing?.discountedPrice?.monthly ?? pricing?.originalPrice?.monthly ?? null;
	const currencyCode = pricing?.currencyCode ?? '';

	// Owners with a linked purchase can manage billing; everyone else views the read-only plan page.
	const canManagePlan = Boolean( isOwner && currentPlan.purchaseId );
	const planActionHref = canManagePlan
		? `/purchases/subscriptions/${ selectedSite.slug }/${ currentPlan.purchaseId }`
		: `/plans/my-plan/${ selectedSite.slug }`;

	const monthlyPriceWrapper = <span className="student-plans-page__price-card-value" />;
	const priceDescription = <span className="student-plans-page__price-card-interval" />;

	const priceContent =
		annualPlanPrice !== null && annualPlanMonthlyPrice !== null && currencyCode
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
			: null;

	return (
		<>
			<BodySectionCssClass bodyClass={ BODY_CLASS } />
			<Card className="student-plans-page__price-card">
				<div className="student-plans-page__price-card-text">
					<span className="student-plans-page__price-card-label">{ translate( 'My Plan' ) }</span>
					<span className="student-plans-page__price-card-title">{ studentPlan.getTitle() }</span>
					<span className="student-plans-page__price-card-subtitle">
						{ studentPlan.getPlanTagline?.() }
					</span>
				</div>
				<div className="student-plans-page__price-card-conditions">{ priceContent }</div>
				<div className="student-plans-page__price-card-cta-wrapper">
					<Button
						className="student-plans-page__price-card-cta"
						onClick={ () => page( planActionHref ) }
					>
						{ canManagePlan ? translate( 'Manage my plan' ) : translate( 'View plan' ) }
					</Button>
				</div>
			</Card>
			<div className="student-plans-page__grid is-2023-pricing-grid">
				<PlansFeaturesMain
					siteId={ selectedSite.ID }
					intervalType={ selectedInterval }
					intent="plans-student"
					displayedIntervals={ DISPLAYED_INTERVALS }
					showPlanTypeSelectorDropdown
					hideUnavailableFeatures
					hidePlansFeatureComparison
					coupon={ coupon }
					redirectTo={ redirectTo }
					pluginSlug={ pluginSlug }
					discountEndDate={ discountEndDate }
				/>
			</div>
		</>
	);
};

export default StudentPlansPage;
