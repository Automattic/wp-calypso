import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { useEffect } from 'react';
import useAddHostingTrialMutation, {
	HOSTING_INTENT_MIGRATE,
} from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { Step } from '../../types';

const SiteMigrationAssignTrialPlanStep: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const site = useSite();

	const dispatch = useDispatch();
	const { addHostingTrial } = useAddHostingTrialMutation( {
		onSuccess: () => {
			// After the trial is added, we need to request the site again to get the updated plan
			site && dispatch( requestSite( site.ID ) );
			submit?.();
		},
		onError: () => {
			// If adding the trial fails, submit with error dependency.
			submit?.( { error: true } );
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

	return null;
};

export default SiteMigrationAssignTrialPlanStep;
