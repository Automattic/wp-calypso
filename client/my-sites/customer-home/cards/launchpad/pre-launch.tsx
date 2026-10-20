import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import PreLaunchSiteModal from 'calypso/components/pre-launch-site-modal';
import { useSiteLaunchPublishCopy } from 'calypso/dashboard/utils/site-launch-publish-copy';
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

const LaunchpadPreLaunch = ( props: LaunchpadPreLaunchProps ): JSX.Element | null => {
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const site = useSelector( ( state: AppState ) => getSite( state, siteId ) );
	const checklistSlug = site?.options?.site_intent ?? '';

	const { onSiteLaunched } = useCelebrateLaunchModalSideEffects( siteId );
	const translate = useTranslate();
	const { isLoading: isPublishCopyLoading, usePublishCopy } = useSiteLaunchPublishCopy( {
		launchStatus: site?.launch_status,
		canManageOptions: site?.capabilities?.manage_options,
		isA4ADevSite: site?.is_a4a_dev_site,
	} );

	const [ isLaunchModalOpen, setIsLaunchModalOpen ] = useState( false );

	const launchUrl = addQueryArgs( '/setup/launch-site', { siteSlug: site?.slug } );

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

	// The server titles the launch tasks without assigning the user, so it can say "Launch" for
	// someone this hook has just put in the treatment.
	const publishTaskTitles: Record< string, string > = {
		site_launched: translate( 'Publish your site' ),
		link_in_bio_launched: translate( 'Publish your site' ),
		videopress_launched: translate( 'Publish site' ),
		blog_launched: translate( 'Publish your blog' ),
	};
	const retitleLaunchTasks = ( tasks: Task[] ) =>
		usePublishCopy
			? tasks.map( ( task ) =>
					publishTaskTitles[ task.id ] ? { ...task, title: publishTaskTitles[ task.id ] } : task
				)
			: tasks;

	// Render neither copy until the copy experiment answers.
	if ( isPublishCopyLoading ) {
		return null;
	}

	return (
		<>
			<CustomerHomeLaunchpad
				checklistSlug={ props.checklistSlug ?? checklistSlug }
				onPostFilterTasks={ retitleLaunchTasks }
				onTaskClick={ handleTaskClick }
				onSiteLaunched={ () => onSiteLaunched( !! site?.is_wpcom_atomic ) }
			/>
			{ ! isFreePlan && (
				<PreLaunchSiteModal
					siteId={ siteId }
					isOpen={ isLaunchModalOpen }
					onClose={ () => setIsLaunchModalOpen( false ) }
					launchUrl={ launchUrl }
					usePublishCopy={ usePublishCopy }
				/>
			) }
		</>
	);
};

export default LaunchpadPreLaunch;
