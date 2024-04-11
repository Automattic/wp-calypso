import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingBar } from 'calypso/components/loading-bar';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import useAddHostingTrialMutation, {
	HOSTING_INTENT_MIGRATE,
} from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

import './style.scss';

const SiteMigrationAssignTrialPlanStep: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
	const progress = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getProgress(),
		[]
	);
	const site = useSite();

	const dispatch = useDispatch();
	const { addHostingTrial, isSuccess } = useAddHostingTrialMutation( {
		onSuccess: () => {
			// After the trial is added, we need to request the site again to get the updated plan
			site && dispatch( requestSite( site.ID ) );
		},
	} );

	useEffect( () => {
		if ( submit && site ) {
			const assignMigrationTrialPlan = () => {
				site.ID && addHostingTrial( site.ID, PLAN_MIGRATION_TRIAL_MONTHLY, HOSTING_INTENT_MIGRATE );
			};

			assignMigrationTrialPlan();

			if ( isSuccess ) {
				submit();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ submit ] );

	return (
		<>
			<DocumentHead title={ __( 'Adding your free trial' ) } />
			<StepContainer
				shouldHideNavButtons={ true }
				hideFormattedHeader={ true }
				stepName="site-migration-assign-trial-plan-step"
				isHorizontalLayout={ true }
				recordTracksEvent={ recordTracksEvent }
				stepContent={
					<>
						<div className="site-migration-assign-trial-plan-step">
							<h1 className="site-migration-assign-trial-plan-step__progress-step">
								{ __( 'Adding your free trial' ) }
							</h1>
							{ progress >= 0 ? <LoadingBar progress={ progress } /> : <LoadingEllipsis /> }
							<p className="processing-step__subtitle">
								{ __( 'Your free trial is currently being set up and may take a few minutes.' ) }
							</p>
						</div>
					</>
				}
				showFooterWooCommercePowered={ false }
			/>
		</>
	);
};

export default SiteMigrationAssignTrialPlanStep;
