import { getPlan, PLAN_STUDENT } from '@automattic/calypso-products';
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

interface StudentPlansPageProps {
	currentPlan: SitePlan;
	selectedSite: SiteDetails;
	intervalType?: string;
}

const StudentPlansPage = ( { currentPlan, selectedSite, intervalType }: StudentPlansPageProps ) => {
	const translate = useTranslate();
	const studentPlan = getPlan( PLAN_STUDENT );

	const selectedInterval = UPGRADE_INTERVALS.includes( intervalType as UpgradeInterval )
		? ( intervalType as UpgradeInterval )
		: 'yearly';

	// The current plan's pricing comes from the site's plans (it is not a publicly-priced catalog plan).
	const annualPlanPrice = currentPlan?.pricing?.originalPrice?.full ?? 0;
	const annualPlanMonthlyPrice = currentPlan?.pricing?.originalPrice?.monthly ?? 0;
	const currencyCode = currentPlan?.pricing?.currencyCode ?? '';

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
					intervalType={ selectedInterval }
					intent="plans-student"
					displayedIntervals={ [ ...UPGRADE_INTERVALS ] }
					showPlanTypeSelectorDropdown
					hideUnavailableFeatures
					hidePlansFeatureComparison
				/>
			</div>
		</>
	);
};

export default StudentPlansPage;
