import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	LaunchpadNavigator,
	sortLaunchpadTasksByCompletionStatus,
	useLaunchpad,
} from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import Launchpad from './launchpad';
import { setUpActionsForTasks } from './setup-actions';
import type { Task } from './types';

type DefaultWiredLaunchpadProps = {
	siteSlug: string | null;
	checklistSlug: string;
	launchpadContext: string;
	onSiteLaunched?: () => void;
};

const DefaultWiredLaunchpad = ( {
	siteSlug,
	checklistSlug,
	launchpadContext,
	onSiteLaunched,
}: DefaultWiredLaunchpadProps ) => {
	const {
		data: { checklist },
	} = useLaunchpad( siteSlug, checklistSlug );

	const { setActiveChecklist } = useDispatch( LaunchpadNavigator.store );

	const tasklistCompleted = checklist?.every( ( task: Task ) => task.completed ) || false;

	const tracksData = { recordTracksEvent, checklistSlug, tasklistCompleted, launchpadContext };

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;

	useEffect( () => {
		// Record task list view as a whole.
		recordTracksEvent( 'calypso_launchpad_tasklist_viewed', {
			checklist_slug: checklistSlug,
			tasks: `,${ checklist?.map( ( task: Task ) => task.id ).join( ',' ) },`,
			is_completed: tasklistCompleted,
			number_of_steps: numberOfSteps,
			number_of_completed_steps: completedSteps,
			context: launchpadContext,
		} );

		// Record views for each task.
		checklist?.map( ( task: Task ) => {
			recordTracksEvent( 'calypso_launchpad_task_view', {
				checklist_slug: checklistSlug,
				task_id: task.id,
				is_completed: task.completed,
				context: launchpadContext,
				order: task.order,
			} );
		} );
	}, [
		checklist,
		checklistSlug,
		completedSteps,
		numberOfSteps,
		tasklistCompleted,
		launchpadContext,
	] );

	const taskFilter = ( tasks: Task[] ) => {
		return setUpActionsForTasks( {
			tasks,
			siteSlug,
			tracksData,
			extraActions: {
				setActiveChecklist,
			},
			eventHandlers: {
				onSiteLaunched,
			},
		} );
	};

	const launchpadOptions = {
		onSuccess: sortLaunchpadTasksByCompletionStatus,
	};

	return (
		<Launchpad
			siteSlug={ siteSlug }
			checklistSlug={ checklistSlug }
			taskFilter={ taskFilter }
			useLaunchpadOptions={ launchpadOptions }
		/>
	);
};

export default DefaultWiredLaunchpad;
