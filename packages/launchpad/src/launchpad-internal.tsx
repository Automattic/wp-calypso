import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLaunchpad } from '@automattic/data-stores';
import { useRef, useMemo } from 'react';
import Checklist, { Placeholder as ChecklistPlaceHolder } from './checklist';
import type { Task } from './types';
import type { UseLaunchpadOptions } from '@automattic/data-stores';

export interface LaunchpadInternalProps {
	siteSlug: string | null;
	checklistSlug?: string | null;
	makeLastTaskPrimaryAction?: boolean;
	taskFilter?: ( tasks: Task[] ) => Task[];
	useLaunchpadOptions?: UseLaunchpadOptions;
	launchpadContext?: string | undefined;
}

/**
 * Low-level launchpad component that should only be used in exceptional cases.
 * Please use the main Launchpad component whenever possible.
 */
const LaunchpadInternal = ( {
	siteSlug,
	checklistSlug,
	taskFilter,
	makeLastTaskPrimaryAction,
	useLaunchpadOptions = {},
	launchpadContext,
}: LaunchpadInternalProps ) => {
	const launchpadData = useLaunchpad(
		siteSlug || '',
		checklistSlug,
		useLaunchpadOptions,
		launchpadContext
	);
	const { isFetchedAfterMount, data } = launchpadData;
	const { checklist } = data;
	const tasks = useRef< Task[] >( [] );
	const tasklistCompleted = checklist?.every( ( task: Task ) => task.completed ) || false;

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;

	useMemo( () => {
		const originalTasks = data.checklist || [];
		tasks.current = taskFilter ? taskFilter( originalTasks ) : originalTasks;
	}, [ data, taskFilter ] );

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

	return (
		<div className="launchpad__checklist-wrapper">
			{ isFetchedAfterMount ? (
				<Checklist
					tasks={ tasks.current }
					makeLastTaskPrimaryAction={ makeLastTaskPrimaryAction }
				/>
			) : (
				<ChecklistPlaceHolder />
			) }
		</div>
	);
};

export default LaunchpadInternal;
