import { useLaunchpad } from '@automattic/data-stores';
import { setUpActionsForTasks } from '@automattic/launchpad';
import { useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ShareSiteModal from '../../components/share-site-modal';
import CustomerHomeLaunchpad from '.';
import type { SiteDetails } from '@automattic/data-stores';
import type { Task } from '@automattic/launchpad';
import type { AppState } from 'calypso/types';

import './style.scss';

const launchpadContext = 'customer-home';
const checklistSlug = 'intent-build';

const LaunchpadIntentBuild = (): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId ) || undefined;
	// The type definition for getSite is incorrect, it returns a SiteDetails object
	const site = useSelector(
		( state: AppState ) => getSite( state as object, siteId ) as any as SiteDetails
	);

	const siteSlug = site?.slug || null;

	const {
		data: { checklist },
	} = useLaunchpad( siteSlug, checklistSlug );

	const [ shareSiteModalIsOpen, setShareSiteModalIsOpen ] = useState( false );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	const tasklistCompleted = completedSteps === numberOfSteps;
	const tracksData = { recordTracksEvent, checklistSlug, tasklistCompleted, launchpadContext };
	const extraActions = { setShareSiteModalIsOpen };

	const sortedTasksWithActions = ( tasks: Task[] ) => {
		return setUpActionsForTasks( { tasks, siteSlug, tracksData, extraActions } );
	};

	return (
		<>
			<CustomerHomeLaunchpad
				checklistSlug={ checklistSlug }
				taskFilter={ sortedTasksWithActions }
			></CustomerHomeLaunchpad>
			{ shareSiteModalIsOpen && (
				<ShareSiteModal setModalIsOpen={ setShareSiteModalIsOpen } site={ site } />
			) }
		</>
	);
};

export default LaunchpadIntentBuild;
