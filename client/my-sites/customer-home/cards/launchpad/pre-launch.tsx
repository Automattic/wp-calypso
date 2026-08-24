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

	// A free site can never qualify for the pre-launch modal (it needs a paid
	// plan), so skip mounting the bridge for it — the redirect stays instant with
	// no site/domains fetch. Unknown plans (site not loaded yet) fall through to
	// the bridge, which settles the decision against authoritative data.
	const isFreePlan = site?.plan?.is_free ?? false;

	const handleTaskClick = ( task: Task ) => {
		if ( task.id !== 'site_launched' ) {
			return;
		}

		// Open the shared pre-launch bridge. It shows the confirmation modal for
		// paid-plan + custom-domain sites and otherwise hands off to the
		// `launchUrl` flow, matching the previous behavior.
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
