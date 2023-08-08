import { SiteDetails } from '@automattic/data-stores';
import { useCallback } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SitePlanData } from 'calypso/my-sites/checkout/composite-checkout/hooks/product-variants';
import { BusinessTrialPlans } from '../business-trial-plans';
import TrialBanner from '../trial-banner';

import './style.scss';

interface BusinessTrialPlansPageProps {
	currentPlan: SitePlanData;
	interval?: 'monthly' | 'yearly';
	selectedSite: SiteDetails;
	// siteId: number | null;
}

const BusinessTrialPlansPage = ( props: BusinessTrialPlansPageProps ) => {
	const { selectedSite } = props;

	const triggerPlansGridTracksEvent = useCallback( ( planSlug: string ) => {
		recordTracksEvent( 'calypso_business_trial_plans_page_upgrade_cta_clicked', {
			location: 'plans_grid',
			plan_slug: planSlug,
		} );
	}, [] );

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-migration-trial-plan' ] } />

			<div className="migration-trial-plans__banner-wrapper">
				<TrialBanner />
			</div>
			<BusinessTrialPlans
				siteId={ selectedSite.ID }
				siteSlug={ selectedSite.slug }
				triggerTracksEvent={ triggerPlansGridTracksEvent }
			/>
		</>
	);
};

export default BusinessTrialPlansPage;
