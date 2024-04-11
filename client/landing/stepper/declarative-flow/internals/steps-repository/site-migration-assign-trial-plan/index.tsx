import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { StepContainer, Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import useAddHostingTrialMutation, {
	HOSTING_INTENT_MIGRATE,
} from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import type { Step } from '../../types';

import './style.scss';

const SiteMigrationAssignTrialPlanStep: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();

	const dispatch = useDispatch();
	const { addHostingTrial, isError } = useAddHostingTrialMutation( {
		onSuccess: () => {
			// After the trial is added, we need to request the site again to get the updated plan
			site && dispatch( requestSite( site.ID ) );
			submit?.();
		},
		onError: () => {
			// If the trial fails to be added, submit with error dependency.
			submit?.( { error: isError } );
		},
	} );

	useEffect( () => {
		if ( site ) {
			const assignMigrationTrialPlan = () => {
				site.ID && addHostingTrial( site.ID, PLAN_MIGRATION_TRIAL_MONTHLY, HOSTING_INTENT_MIGRATE );
			};

			assignMigrationTrialPlan();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<>
			<DocumentHead title={ __( 'Adding your free trial' ) } />
			<StepContainer
				shouldHideNavButtons={ true }
				hideFormattedHeader={ true }
				stepName="site-migration-assign-trial-plan"
				isHorizontalLayout={ true }
				recordTracksEvent={ recordTracksEvent }
				stepContent={
					<>
						<div className="site-migration-assign-trial-plan__center">
							<div className="site-migration-assign-trial-plan__header site-migration-assign-trial-plan__loading">
								<Title>{ __( 'Adding your free trial' ) }</Title>
								<LoadingEllipsis />
							</div>
						</div>
					</>
				}
				showFooterWooCommercePowered={ false }
			/>
		</>
	);
};

export default SiteMigrationAssignTrialPlanStep;
