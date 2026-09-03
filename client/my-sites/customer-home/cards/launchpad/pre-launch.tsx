import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import PreLaunchSiteModal from 'calypso/components/pre-launch-site-modal';
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

	const [ isLaunchModalOpen, setIsLaunchModalOpen ] = useState( false );

	const launchUrl = addQueryArgs( '/start/launch-site', { siteSlug: site?.slug } );

	// A free site can never qualify (needs a paid plan), so skip the bridge and
	// redirect instantly. Unknown plans fall through and settle in the bridge.
	const isFreePlan = site?.plan?.is_free ?? false;

	const handleTaskClick = ( task: Task ) => {
		if ( task.id !== 'site_launched' ) {
			return;
		}

		// Hand off to the pre-launch bridge, which confirms for qualifying sites.
		if ( isFreePlan ) {
			window.location.assign( launchUrl );
			return false;
		}

		setIsLaunchModalOpen( true );
		return false;
	};

	return (
		<>
			<CustomerHomeLaunchpad
				checklistSlug={ props.checklistSlug ?? checklistSlug }
				onTaskClick={ handleTaskClick }
				onSiteLaunched={ () => onSiteLaunched( !! site?.is_wpcom_atomic ) }
			/>
			{ ! isFreePlan && (
				<PreLaunchSiteModal
					siteId={ siteId }
					isOpen={ isLaunchModalOpen }
					onClose={ () => setIsLaunchModalOpen( false ) }
					launchUrl={ launchUrl }
				/>
			) }
		</>
	);
};

export default LaunchpadPreLaunch;
