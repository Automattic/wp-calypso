import { SiteDetails } from '@automattic/data-stores';
import { useCallback } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { BusinessTrialPlans } from '../business-trial-plans';
import TrialBanner from '../trial-banner';

import './style.scss';

interface BusinessTrialPlansPageProps {
	selectedSite: SiteDetails;
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
			<BodySectionCssClass bodyClass={ [ 'is-business-trial-plan' ] } />

			<div className="business-trial-plans__banner-wrapper">
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
