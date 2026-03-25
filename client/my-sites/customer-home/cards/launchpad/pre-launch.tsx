import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CelebrateLaunchModal from '../../components/celebrate-launch-modal';
import { useCelebrateLaunchModal } from './use-celebrate-launch-modal';
import CustomerHomeLaunchpad from '.';
import type { Task } from '@automattic/launchpad';
import type { AppState } from 'calypso/types';

type LaunchpadPreLaunchProps = {
	checklistSlug?: string;
};

const LaunchpadPreLaunch = ( props: LaunchpadPreLaunchProps ): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const site = useSelector( ( state: AppState ) => getSite( state, siteId ) );
	const checklistSlug = site?.options?.site_intent ?? '';
	const { data: allDomains = [], isFetchedAfterMount } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );

	const layout = useHomeLayoutQuery( siteId || null );
	const { isOpen, setModalIsOpen, handleSiteLaunched } = useCelebrateLaunchModal( siteId, layout );

	const [ , experimentData ] = useExperiment( 'calypso_standardized_site_launch_gating' );
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

		if ( experimentAssignment === 'gated_site_launch' ) {
			window.location.assign( `/start/launch-site?siteSlug=${ site?.slug }` );
			return false;
		}

		throw new Error( 'Invalid experiment assignment' );
	};

	return (
		<>
			<CustomerHomeLaunchpad
				checklistSlug={ props.checklistSlug ?? checklistSlug }
				onTaskClick={ handleTaskClick }
				onSiteLaunched={ () => handleSiteLaunched( !! site?.is_wpcom_atomic ) }
			/>
			{ isOpen && isFetchedAfterMount && (
				<CelebrateLaunchModal
					setModalIsOpen={ setModalIsOpen }
					site={ site }
					allDomains={ allDomains }
				/>
			) }
		</>
	);
};

export default LaunchpadPreLaunch;
