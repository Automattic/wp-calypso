import { PLAN_BUSINESS } from '@automattic/calypso-products';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { IntervalType } from 'calypso/my-sites/plans-features-main/types';
import ECommerceTrialBanner from '../ecommerce-trial/ecommerce-trial-banner';
import type { Site } from 'calypso/my-sites/scan/types';

import './style.scss';

interface BusinessTrialPlansPageProps {
	redirectToAddDomainFlow: boolean;
	domainAndPlanPackage: boolean;
	intervalType: IntervalType;
	customerType: string;
	selectedFeature: string;
	redirectTo: string;
	selectedSite: Site;
	isDomainAndPlanPackageFlow: boolean;
	isDomainUpsell: boolean;
	isDomainUpsellSuggested: boolean;
}

const BusinessTrialPlansPage = ( props: BusinessTrialPlansPageProps ) => {
	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-migration-trial-plan' ] } />

			<div className="migration-trial-plans__banner-wrapper">
				<ECommerceTrialBanner />
			</div>

			<PlansFeaturesMain
				redirectToAddDomainFlow={ props.redirectToAddDomainFlow }
				hidePlanTypeSelector={ false }
				hideFreePlan={ true }
				customerType={ props.customerType }
				intervalType={ props.intervalType }
				selectedFeature={ props.selectedFeature }
				siteId={ props.selectedSite?.ID }
				plansWithScroll={ false }
				selectedPlan={ PLAN_BUSINESS }
				hidePlansFeatureComparison={ props.isDomainAndPlanPackageFlow }
				showLegacyStorageFeature={ false }
				isSpotlightOnCurrentPlan={ ! props.isDomainAndPlanPackageFlow }
			/>
		</>
	);
};

export default BusinessTrialPlansPage;
