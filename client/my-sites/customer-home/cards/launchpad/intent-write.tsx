import { useLaunchpad } from '@automattic/data-stores';
import { setUpActions } from '@automattic/launchpad';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CustomerHomeLaunchpad from '.';
import type { Task } from '@automattic/launchpad';
import type { AppState } from 'calypso/types';

const checklistSlug = 'intent-write';

const LaunchpadIntentWrite = (): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) );

	const {
		data: { checklist },
	} = useLaunchpad( siteSlug, checklistSlug );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	const tasklistCompleted = numberOfSteps > 0 && completedSteps === numberOfSteps;

	const recordTaskClickTracksEvent = ( task: Task ) => {
		recordTracksEvent( 'calypso_launchpad_task_clicked', {
			checklist_slug: checklistSlug,
			checklist_completed: tasklistCompleted,
			task_id: task.id,
			is_completed: task.completed,
			context: 'customer-home',
		} );
	};

	const sortedTasksWithActions = ( tasks: Task[] ) => {
		const tasksWithActions = setUpActions( tasks, siteSlug );

		const completedTasks = tasksWithActions.filter( ( task: Task ) => task.completed );
		const incompleteTasks = tasksWithActions.filter( ( task: Task ) => ! task.completed );

		const sortedTasks = [ ...completedTasks, ...incompleteTasks ];

		// Add Tracks events to all tasks before dispatching the original action.
		return sortedTasks.map( ( task: Task ) => {
			recordTracksEvent( 'calypso_launchpad_task_view', {
				checklist_slug: checklistSlug,
				task_id: task.id,
				is_completed: task.completed,
				context: 'customer-home',
			} );

			const originalAction = task.actionDispatch;
			const newAction = () => {
				recordTaskClickTracksEvent( task );
				return originalAction?.();
			};

			return { ...task, actionDispatch: newAction };
		} );
	};

	return (
		<CustomerHomeLaunchpad
			checklistSlug={ checklistSlug }
			taskFilter={ sortedTasksWithActions }
		></CustomerHomeLaunchpad>
	);
};

export default LaunchpadIntentWrite;
