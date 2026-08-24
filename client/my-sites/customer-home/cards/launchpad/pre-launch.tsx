import { useSiteLaunchGatingVariant } from 'calypso/lib/use-site-launch-gating-variant';
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

	const [ , variant ] = useSiteLaunchGatingVariant();

	const handleTaskClick = ( task: Task ) => {
		if ( task.id !== 'site_launched' ) {
			return;
		}

		// Site launch gating: 'semi_gated_site_launch' is the shipped default.
		// The other branches are scaffolding for future experiments; see
		// useSiteLaunchGatingVariant().
		switch ( variant ) {
			case 'semi_gated_site_launch':
			case null:
			default: {
				window.location.assign( `/start/launch-site?siteSlug=${ site?.slug }` );
				return false;
			}
		}
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
