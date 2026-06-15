import { useExperiment } from 'calypso/lib/explat';
import { useCelebrateLaunchModalSideEffects } from 'calypso/my-sites/customer-home/celebrate-site-launch-modal/use-side-effects';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CustomerHomeLaunchpad from '.';
import type { Task } from '@automattic/launchpad';
import type { AppState } from 'calypso/types';
import type { JSX } from 'react';

type LaunchpadPreLaunchProps = {
	checklistSlug?: string;
};

const LaunchpadPreLaunch = ( props: LaunchpadPreLaunchProps ): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const site = useSelector( ( state: AppState ) => getSite( state, siteId ) );
	const checklistSlug = site?.options?.site_intent ?? '';

	const { onSiteLaunched } = useCelebrateLaunchModalSideEffects( siteId );

	const [ , experimentData ] = useExperiment( 'calypso_standardized_site_launch_gating_202603_v1' );
	const experimentAssignment = experimentData?.variationName;

	const handleTaskClick = ( task: Task ) => {
		// No experiment assignment (i.e., control) or not the site launch task
		if ( task.id !== 'site_launched' || ! experimentAssignment ) {
			return;
		}

		// Ungated site launch. When the action is completed, handleSiteLaunched will be called.
		if ( experimentAssignment === 'ungated_site_launch' ) {
			return;
		}

		if ( experimentAssignment === 'semi_gated_site_launch' ) {
			window.location.assign( `/start/launch-site?siteSlug=${ site?.slug }` );
			return false;
		}

		throw new Error( 'Invalid experiment assignment' );
	};

	return (
		<CustomerHomeLaunchpad
			checklistSlug={ props.checklistSlug ?? checklistSlug }
			onTaskClick={ handleTaskClick }
			onSiteLaunched={ () => onSiteLaunched( !! site?.is_wpcom_atomic ) }
		/>
	);
};

export default LaunchpadPreLaunch;
