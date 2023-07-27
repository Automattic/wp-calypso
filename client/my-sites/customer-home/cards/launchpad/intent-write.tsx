import { useLaunchpad } from '@automattic/data-stores';
import { setUpActionsForTasks } from '@automattic/launchpad';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CustomerHomeLaunchpad from '.';
import type { Task } from '@automattic/launchpad';
import type { AppState } from 'calypso/types';

const checklistSlug = 'intent-write';
const launchpadContext = 'customer-home';

const LaunchpadIntentWrite = (): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) );

	const {
		data: { checklist },
	} = useLaunchpad( siteSlug, checklistSlug );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	const tasklistCompleted = numberOfSteps > 0 && completedSteps === numberOfSteps;
	const tracksData = { recordTracksEvent, checklistSlug, tasklistCompleted, launchpadContext };

	const sortedTasksWithActions = ( tasks: Task[] ) => {
		return setUpActionsForTasks( { tasks, siteSlug, tracksData } );
	};

	return (
		<CustomerHomeLaunchpad
			checklistSlug={ checklistSlug }
			taskFilter={ sortedTasksWithActions }
		></CustomerHomeLaunchpad>
	);
};

export default LaunchpadIntentWrite;
