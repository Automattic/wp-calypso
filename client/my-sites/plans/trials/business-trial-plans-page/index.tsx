import { PLAN_BUSINESS } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getTrialCheckoutUrl } from '../../../../lib/trials/get-trial-checkout-url';
import { BusinessTrialPlans } from '../business-trial-plans';
import TrialBanner from '../trial-banner';

import './style.scss';

interface BusinessTrialPlansPageProps {
	selectedSite: SiteDetails;
}

const BusinessTrialPlansPage = ( props: BusinessTrialPlansPageProps ) => {
	const { selectedSite } = props;
	const translate = useTranslate();

	const triggerPlansGridTracksEvent = useCallback( ( planSlug: string ) => {
		recordTracksEvent( 'calypso_business_trial_plans_page_upgrade_cta_clicked', {
			location: 'plans_grid',
			plan_slug: planSlug,
		} );
	}, [] );

	/**
	 * Redirects to the checkout page with Plan on cart.
	 */
	const goToCheckoutWithPlan = () => {
		recordTracksEvent( 'calypso_business_trial_plans_page_upgrade_cta_clicked', {
			location: 'trial_card',
			plan_slug: PLAN_BUSINESS,
		} );

		const checkoutUrl = getTrialCheckoutUrl( {
			productSlug: PLAN_BUSINESS,
			siteSlug: selectedSite?.slug ?? '',
		} );

		page.redirect( checkoutUrl );
	};

	const bannerCallToAction = (
		<Button className="trial-current-plan__trial-card-cta" primary onClick={ goToCheckoutWithPlan }>
			{ translate( 'Upgrade now' ) }
		</Button>
	);

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-business-trial-plan' ] } />

			<div className="business-trial-plans__banner-wrapper">
				<TrialBanner callToAction={ bannerCallToAction } />
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
