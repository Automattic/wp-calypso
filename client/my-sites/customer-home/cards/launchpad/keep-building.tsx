import { useLaunchpad } from '@automattic/data-stores';
import { setUpActionsForTasks } from '@automattic/launchpad';
import { useState } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ShareSiteModal from '../../components/share-site-modal';
import CustomerHomeLaunchpad from '.';
import type { SiteDetails } from '@automattic/data-stores';
import type { Task } from '@automattic/launchpad';

import './style.scss';

const checklistSlug = 'keep-building';
const launchpadContext = 'customer-home';

interface LaunchpadKeepBuildingProps {
	site: SiteDetails | null;
}

const LaunchpadKeepBuilding = ( { site }: LaunchpadKeepBuildingProps ): JSX.Element => {
	const siteSlug = site?.slug || null;

	const {
		data: { checklist },
	} = useLaunchpad( siteSlug, checklistSlug );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	const tasklistCompleted = completedSteps === numberOfSteps;
	const tracksData = { recordTracksEvent, checklistSlug, tasklistCompleted, launchpadContext };

	const [ shareSiteModalIsOpen, setShareSiteModalIsOpen ] = useState( false );

	const sortedTasksWithActions = ( tasks: Task[] ) => {
		const tasksWithActions = setUpActionsForTasks( tasks, siteSlug, tracksData );

		// Add action to `share_site` task, which has a custom UI.
		const shareSiteTask = tasksWithActions.find( ( task: Task ) => task.id === 'share_site' );
		if ( shareSiteTask ) {
			shareSiteTask.actionDispatch = () => {
				setShareSiteModalIsOpen( true );
			};
		}

		const completedTasks = tasksWithActions.filter( ( task: Task ) => task.completed );
		const incompleteTasks = tasksWithActions.filter( ( task: Task ) => ! task.completed );

		const sortedTasks = [ ...completedTasks, ...incompleteTasks ];

		return sortedTasks;
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

const ConnectedLaunchpadKeepBuilding = connect( ( state ) => {
	const siteId = getSelectedSiteId( state ) || undefined;
	// The type definition for getSite is incorrect, it returns a SiteDetails object
	const site = getSite( state as object, siteId ) as any as SiteDetails;

	return { site };
} )( LaunchpadKeepBuilding );

export default ConnectedLaunchpadKeepBuilding;
